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
    static async findKnex(ent, q) {
        const ent_table = intern.tablenameUtil(ent);
        const entp = intern.makeentp(ent);
        const args = {
            table_name: ent_table,
            data: intern.isObjectEmpty(q) ? false : entp
        };
        const query = await qbuilder_1.default.select(args);
        return query.map((row) => intern.makeent(ent, row));
    }
    static async firstKnex(ent, q) {
        const ent_table = intern.tablenameUtil(ent);
        const args = {
            table_name: ent_table,
            filter: q
        };
        const query = await qbuilder_1.default.first(args);
        // return query
        return intern.makeent(ent, query);
    }
    static async insertKnex(ent, data) {
        const ent_table = intern.tablenameUtil(ent);
        const entp = intern.makeentp(ent);
        const args = {
            table_name: ent_table,
            data: { ...entp, id: entp.id ? entp.id : Uuid() },
        };
        const query = await qbuilder_1.default.insert(args);
        const formattedQuery = query.length == 1 ? query[0] : query;
        return intern.makeent(ent, formattedQuery);
    }
    static async updateKnex(ent, data) {
        const ent_table = intern.tablenameUtil(ent);
        const entp = intern.makeentp(ent);
        const { id, ...rest } = entp;
        const args = {
            table_name: ent_table,
            data: rest,
            id: id
        };
        const query = await qbuilder_1.default.update(args);
        const formattedQuery = query.length == 1 ? query[0] : query;
        // return query
        return intern.makeent(ent, formattedQuery);
    }
    static async removeKnex(ent, q) {
        const ent_table = intern.tablenameUtil(ent);
        const entp = intern.makeentp(ent);
        const args = {
            table_name: ent_table,
            id: entp.id
        };
        if (q.all$) {
            const query = await qbuilder_1.default.truncate(args);
            //Knex returns 1 if delete is ok
            const queryObject = query == 1 ? { delete: true } : { delete: false };
            return queryObject;
        }
        const query = await qbuilder_1.default.delete(args);
        //Knex returns 1 if delete is ok
        const queryObject = query == 1 ? { delete: true } : { delete: false };
        return queryObject;
    }
    static async upsertKnex(ent, data, q) {
        const ent_table = intern.tablenameUtil(ent);
        const args = {
            table_name: ent_table,
            data: data,
            id: q
        };
        const query = qbuilder_1.default.upsert(args);
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
    /*
    * NOTE - KEEP - TX SUPPORT WILL COME FOR THE NEXT VERSION
    */
    static buildCtx(seneca, msg, meta) {
        var _a, _b, _c;
        let ctx = {};
        let transaction = (_c = (_b = (_a = seneca.fixedmeta) === null || _a === void 0 ? void 0 : _a.custom) === null || _b === void 0 ? void 0 : _b.sys__entity) === null || _c === void 0 ? void 0 : _c.transaction;
        if (transaction && false !== msg.transaction$) {
            transaction.trace.push({
                when: Date.now(),
                msg,
                meta,
            });
            ctx = {
                transaction: transaction,
                client: transaction.client,
            };
        }
        return ctx;
    }
    static msgForGenerateId(args) {
        const { role, target } = args;
        return { role, target, hook: 'generate_id' };
    }
    static generateId() {
        const uuidV4 = Uuid();
        return uuidV4;
    }
    // KEEP! TX SUPPORT WILL COME FOR THE NEXT VERSION
    static async withDbClient(dbPool, ctx, f) {
        ctx = ctx || {};
        let isTransaction = !!ctx.transaction;
        ctx.client = ctx.client || await dbPool.connect();
        if (isTransaction) {
            if (null == ctx.transaction.client) {
                ctx.transaction.client = ctx.client;
                await ctx.client.query('BEGIN');
            }
        }
        let result;
        try {
            result = await f(ctx.client);
        }
        catch (e) {
            if (isTransaction) {
                await ctx.client.query('ROLLBACK');
            }
            throw e;
        }
        finally {
            if (!isTransaction) {
                ctx.client.release();
            }
        }
        return result;
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
    static async isUpdate(ent) {
        if (!ent.id) {
            return false;
        }
        const id = {
            id: ent.id
        };
        const rowExist = await intern.firstKnex(ent, id);
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