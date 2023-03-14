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
            if (args.isLoadDeleted) {
                return knex(args.table_name).where(args.filter).del().returning('*');
            }
            return knex(args.table_name).where(args.filter).del();
        },
        truncate(args) {
            return knex(args.table_name).truncate();
        },
        select(args) {
            if (args.isArray) {
                return knex(args.table_name).whereIn('id', args.data);
            }
            return args.data
                ? knex(args.table_name).select().where(args.data)
                : knex.select('*').from(args.table_name);
        },
        first(args) {
            return knex(args.table_name).where(args.filter).first();
        },
    };
    return Q;
}
exports.default = qBuilder;
//# sourceMappingURL=qbuilder.js.map