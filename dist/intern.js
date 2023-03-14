"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.intern = void 0;
const qbuilder_1 = __importDefault(require("./qbuilder"));
const Uuid = require('uuid').v4;
const Assert = require('assert');
class intern {
    static asyncMethod(f) {
        return function (msg, done, meta) {
            const seneca = this;
            const p = f.call(seneca, msg, meta);
            Assert('function' === typeof p.then &&
                'function' === typeof p.catch, 'The function must be async, i.e. return a promise.');
            return p
                .then((result) => done(null, result))
                .catch(done);
        };
    }
    static async findKnex(ent, q, knex) {
        const ent_table = intern.tablenameUtil(ent);
        const entp = intern.makeentp(ent);
        const isQArray = Array.isArray(q);
        const filter = intern.isObjectEmpty(q) ? { ...entp } : isQArray ? q : { ...q };
        const args = {
            table_name: ent_table,
            data: intern.isObjectEmpty(filter) ? false : filter,
            isArray: isQArray
        };
        const query = await (0, qbuilder_1.default)(knex).select(args);
        return query.map((row) => intern.makeent(ent, row));
    }
    static async firstKnex(ent, q, knex) {
        const ent_table = intern.tablenameUtil(ent);
        const args = {
            table_name: ent_table,
            filter: q
        };
        const query = await (0, qbuilder_1.default)(knex).first(args);
        // return query
        return intern.makeent(ent, query);
    }
    static async insertKnex(ent, knex) {
        const ent_table = intern.tablenameUtil(ent);
        const entp = intern.makeentp(ent);
        const args = {
            table_name: ent_table,
            data: { ...entp, id: entp.id ? entp.id : Uuid() },
        };
        const query = await (0, qbuilder_1.default)(knex).insert(args);
        const formattedQuery = query.length == 1 ? query[0] : query;
        return intern.makeent(ent, formattedQuery);
    }
    static async updateKnex(ent, knex) {
        const ent_table = intern.tablenameUtil(ent);
        const entp = intern.makeentp(ent);
        const { id, ...rest } = entp;
        const args = {
            table_name: ent_table,
            data: rest,
            id: id
        };
        const query = await (0, qbuilder_1.default)(knex).update(args);
        const formattedQuery = query.length == 1 ? query[0] : query;
        // return query
        return intern.makeent(ent, formattedQuery);
    }
    static async removeKnex(ent, q, knex) {
        const ent_table = intern.tablenameUtil(ent);
        const entp = intern.makeentp(ent);
        const filter = intern.isObjectEmpty(q) ? { ...entp } : { ...q };
        const isLoadDeleted = filter.load$ ? true : false;
        if (isLoadDeleted) {
            delete filter.load$;
        }
        const args = {
            table_name: ent_table,
            filter,
            isLoadDeleted
        };
        if (q.all$) {
            await (0, qbuilder_1.default)(knex).truncate(args);
            //Knex returns the number of rows affected if delete is ok
            return null;
        }
        const query = await (0, qbuilder_1.default)(knex).delete(args);
        //Knex returns the number of rows affected if delete is ok
        const result = typeof query == 'number' ? null : 'Error';
        const formattedQuery = query.length == 1 ? query[0] : query;
        return isLoadDeleted ? intern.makeent(ent, formattedQuery) : result;
    }
    static async upsertKnex(ent, data, q, knex) {
        const ent_table = intern.tablenameUtil(ent);
        const args = {
            table_name: ent_table,
            data: data,
            id: q
        };
        const query = (0, qbuilder_1.default)(knex).upsert(args);
        return query;
    }
    static tablenameUtil(ent) {
        const canon = ent.canon$({ object: true });
        return (canon.base ? canon.base + '_' : '') + canon.name;
    }
    static makeentp(ent) {
        const fields = ent.fields$();
        const entp = {};
        for (const field of fields) {
            if (!intern.isDate(ent[field]) && intern.isObject(ent[field])) {
                entp[field] = JSON.stringify(ent[field]);
            }
            else {
                entp[field] = ent[field];
            }
        }
        return entp;
    }
    static isObject(x) {
        return null != x && '[object Object]' === toString.call(x);
    }
    static isObjectEmpty(object) {
        return Object.keys(object).length === 0;
    }
    static isDate(x) {
        return '[object Date]' === toString.call(x);
    }
    static getConfig(spec) {
        let conf;
        if ('string' === typeof spec) {
            const urlM = /^postgres:\/\/((.*?):(.*?)@)?(.*?)(:?(\d+))?\/(.*?)$/.exec(spec);
            if (!urlM) {
                return null;
            }
            conf = {
                name: urlM[7],
                host: urlM[4],
                username: urlM[2],
                password: urlM[3],
                port: urlM[6] ? parseInt(urlM[6], 10) : null,
            };
        }
        else {
            conf = spec;
        }
        // pg conf properties
        conf.user = conf.username;
        conf.database = conf.name;
        conf.host = conf.host || conf.server;
        conf.username = conf.username || conf.user;
        conf.password = conf.password || conf.pass;
        return conf;
    }
    static msgForGenerateId(args) {
        const { role, target } = args;
        return { role, target, hook: 'generate_id' };
    }
    static generateId() {
        const uuidV4 = Uuid();
        return uuidV4;
    }
    static makeent(ent, row) {
        if (!row) {
            return null;
        }
        const fields = Object.keys(row);
        const entp = {};
        for (const field of fields) {
            let value = row[field];
            try {
                const parsed = JSON.parse(row[field]);
                if (intern.isObject(parsed)) {
                    value = parsed;
                }
            }
            catch (err) {
                if (!(err instanceof SyntaxError)) {
                    throw err;
                }
            }
            entp[field] = value;
        }
        return ent.make$(entp);
    }
    static async isUpdate(ent, knex) {
        if (!ent.id) {
            return false;
        }
        const id = {
            id: ent.id
        };
        const rowExist = await intern.firstKnex(ent, id, knex);
        const isUpdate = rowExist ? true : false;
        return isUpdate;
    }
    static async execQuery(query, ctx) {
        const { client, seneca } = ctx;
        if (!query) {
            const err = new Error('An empty query is not a valid query');
            return seneca.fail(err);
        }
        return client.query(query);
    }
    static deepXformKeys(f, x) {
        if (Array.isArray(x)) {
            return x.map((y) => intern.deepXformKeys(f, y));
        }
        if (intern.isObject(x)) {
            const out = {};
            for (const k in x) {
                out[f(k)] = intern.deepXformKeys(f, x[k]);
            }
            return out;
        }
        return x;
    }
}
exports.intern = intern;
//# sourceMappingURL=intern.js.map