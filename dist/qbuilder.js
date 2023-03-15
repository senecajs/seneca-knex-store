"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function qBuilder(knex) {
    const Q = {
        upsert(args) {
            return knex(args.table_name).upsert(args.data, args.id);
        },
        update(args) {
            return knex(args.table_name)
                .where({ id: args.id })
                .update(args.data)
                .returning('*');
        },
        insert(args) {
            return knex(args.table_name).insert(args.data).returning('*');
        },
        delete(args) {
            let query = knex(args.table_name);
            if (args.skip) {
                query = query.offset(args.skip);
            }
            if (args.isLoad) {
                return knex(args.table_name).where(args.filter).del().returning('*');
            }
            return query.where(args.filter).del();
        },
        truncate(args) {
            return knex(args.table_name).truncate();
        },
        select(args) {
            let query = knex(args.table_name);
            if (args.sort) {
                query = query.orderBy(args.sort.field, args.sort.order);
            }
            if (args.skip) {
                query = query.offset(args.skip);
            }
            if (args.limit) {
                query = query.limit(args.limit);
            }
            if (args.isArray) {
                return query.whereIn('id', args.data);
            }
            if (args.data) {
                return query.where(args.data);
            }
            return query;
        },
        first(args) {
            if (args.sort) {
                return knex(args.table_name)
                    .orderBy(args.sort.field, args.sort.order)
                    .where(args.filter)
                    .offset(args.skip)
                    .first();
            }
            return knex(args.table_name).where(args.filter).offset(args.skip).first();
        },
    };
    return Q;
}
exports.default = qBuilder;
//# sourceMappingURL=qbuilder.js.map