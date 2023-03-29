"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qbuilder_1 = __importDefault(require("./qbuilder"));
const Uuid = require('uuid').v4;
const intern = {
    async findKnex(knex, ent, q) {
        const ent_table = intern.tablenameUtil(ent);
        const entp = intern.makeentp(ent);
        const isQArray = Array.isArray(q);
        const filter = intern.isObjectEmpty(q) ? { ...entp } : isQArray ? q : { ...q };
        if (filter.native$) {
            const argsNative = typeof filter.native$ === 'string' ? {
                query: filter.native$
            } : {
                query: filter.native$[0],
                data: filter.native$.slice(1)
            };
            const query = await (0, qbuilder_1.default)(knex).raw(argsNative);
            return query.rows.map((row) => intern.makeent(ent, row));
        }
        let sort = null;
        let skip = null;
        let limit = null;
        if (filter.sort$) {
            const firstKey = Object.keys(filter.sort$)[0];
            const sortValue = filter.sort$[firstKey] == 1 ? 'ASC' : 'DESC';
            sort = {
                field: firstKey,
                order: sortValue
            };
            delete filter.sort$;
        }
        if (filter.skip$) {
            skip = filter.skip$ > 0 ? filter.skip$ : 0;
            delete filter.skip$;
        }
        if (filter.limit$) {
            limit = filter.limit$ > 0 ? filter.limit$ : null;
            delete filter.limit$;
        }
        const args = {
            table_name: ent_table,
            data: intern.isObjectEmpty(filter) ? false : filter,
            isArray: isQArray,
            sort,
            skip,
            ...(limit && { limit })
        };
        const query = await (0, qbuilder_1.default)(knex).select(args);
        return query.map((row) => intern.makeent(ent, row));
    },
    async firstKnex(knex, ent, q) {
        const ent_table = intern.tablenameUtil(ent);
        let sort = null;
        let skip = null;
        if (q.sort$) {
            const firstKey = Object.keys(q.sort$)[0];
            const sortValue = q.sort$[firstKey] == 1 ? 'ASC' : 'DESC';
            sort = {
                field: firstKey,
                order: sortValue
            };
            delete q.sort$;
        }
        if (q.skip$) {
            skip = q.skip$ > 0 ? q.skip$ : 0;
            delete q.skip$;
        }
        if (q.limit$) {
            delete q.limit$;
        }
        const args = {
            table_name: ent_table,
            filter: q,
            sort,
            skip
        };
        const query = await (0, qbuilder_1.default)(knex).first(args);
        return intern.makeent(ent, query);
    },
    async insertKnex(knex, ent) {
        const ent_table = intern.tablenameUtil(ent);
        const entp = intern.makeentp(ent);
        // ----------------- TODO - UPSERT -----------------//
        // const { upsert$ } = q ? q : null
        // if (upsert$) {
        //   const args = {
        //     table_name: ent_table,
        //     data: {...entp, id: entp.id ? entp.id : Uuid()},
        //     upsert: upsert$.length == 1 ? upsert$[0] : upsert$
        //   }
        //   const query = await QBuilder(knex).insert(args)
        //   const formattedQuery = query.length == 1 ? query[0] : query
        //   return intern.makeent(ent, formattedQuery)
        // }
        const args = {
            table_name: ent_table,
            data: { ...entp, id: entp.id ? entp.id : Uuid() },
        };
        const query = await (0, qbuilder_1.default)(knex).insert(args);
        const formattedQuery = query.length == 1 ? query[0] : query;
        return intern.makeent(ent, formattedQuery);
    },
    async updateKnex(knex, ent) {
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
        return intern.makeent(ent, formattedQuery);
    },
    //Needs to be refactored to a better way/code
    async removeKnex(knex, ent, q) {
        const ent_table = intern.tablenameUtil(ent);
        const entp = intern.makeentp(ent);
        const filter = intern.isObjectEmpty(q) ? { ...entp } : { ...q };
        const isLoad = filter.load$ ? true : false;
        if (isLoad) {
            delete filter.load$;
        }
        let sort = null;
        let limit = null;
        let skip = null;
        let all = null;
        let first = null;
        if (filter.limit$) {
            limit = filter.limit$ > 0 ? filter.limit$ : null;
            delete filter.limit$;
        }
        if (filter.skip$) {
            skip = filter.skip$ > 0 ? filter.skip$ : 0;
            delete filter.skip$;
        }
        if (filter.all$) {
            all = filter.all$;
            delete filter.all$;
        }
        if (filter.sort$ || (all && skip)) {
            if (filter.sort$) {
                const firstKey = Object.keys(filter.sort$)[0];
                const sortValue = filter.sort$[firstKey] == 1 ? 'ASC' : 'DESC';
                sort = {
                    field: firstKey,
                    order: sortValue
                };
            }
            delete filter.sort$;
            delete filter.all$;
            const argsFind = {
                table_name: ent_table,
                filter,
                sort,
                skip
            };
            if (all) {
                const argsSelect = {
                    table_name: ent_table,
                    data: filter,
                    sort,
                    skip,
                    limit
                };
                const ids = await (0, qbuilder_1.default)(knex).select(argsSelect);
                const argsDelete = {
                    table_name: ent_table,
                    filter: ids.map((id) => id.id),
                    isLoad,
                    skip,
                    isArray: true
                };
                await (0, qbuilder_1.default)(knex).delete(argsDelete);
                return null;
            }
            first = await (0, qbuilder_1.default)(knex).first(argsFind);
        }
        const args = {
            table_name: ent_table,
            filter: first ? { id: first.id } : filter,
            isLoad,
            skip
        };
        if (all) {
            await (0, qbuilder_1.default)(knex).truncate(args);
            //Knex returns the number of rows affected if delete is ok
            return null;
        }
        const query = await (0, qbuilder_1.default)(knex).delete(args);
        //Knex returns the number of rows affected if delete is ok
        const result = typeof query == 'number' ? null : 'Error';
        const formattedQuery = typeof query !== 'number' ? query[0] : query;
        return isLoad ? intern.makeent(ent, formattedQuery) : result;
    },
    async upsertKnex(knex, ent, data, q) {
        const ent_table = intern.tablenameUtil(ent);
        const args = {
            table_name: ent_table,
            data: data,
            id: q
        };
        const query = (0, qbuilder_1.default)(knex).upsert(args);
        return query;
    },
    tablenameUtil(ent) {
        const canon = ent.canon$({ object: true });
        return (canon.base ? canon.base + '_' : '') + canon.name;
    },
    makeentp(ent) {
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
    },
    isObject(x) {
        return null != x && '[object Object]' === toString.call(x);
    },
    isObjectEmpty(object) {
        return Object.keys(object).length === 0;
    },
    isDate(x) {
        return '[object Date]' === toString.call(x);
    },
    getConfig(spec) {
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
    },
    makeent(ent, row) {
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
    },
    async isUpdate(knex, ent, q) {
        // ------------- TODO - UPSERT ----------------//
        // const isUpsert = q.upsert$ ? true : false
        // if (isUpsert) {
        //   delete q.upsert$
        // }
        // if (!ent.id && !isUpsert) {
        //   return false
        // }
        if (!ent.id) {
            return false;
        }
        const id = { id: ent.id };
        const rowExist = await intern.firstKnex(knex, ent, id);
        const isUpdate = rowExist ? true : false;
        return isUpdate;
    },
    async getKnexClient(knex, seneca, msg, meta) {
        let transaction = seneca.entity.state().transaction;
        if (transaction && !transaction.finish && false !== msg.transaction$) {
            const trx = await knex.transaction();
            transaction.trace.push({
                when: Date.now(),
                msg,
                meta,
            });
            transaction.client = trx;
            return trx;
        }
        return knex;
    }
};
exports.default = intern;
//# sourceMappingURL=intern.js.map