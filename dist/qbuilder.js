"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knex = require('knex')({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        port: 5433,
        user: 'senecatest',
        password: 'senecatest_0102',
        database: 'senecatest_knex',
    },
    // debug: true,
});
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
        return knex(args.table_name).where({ id: args.id }).del();
    },
    truncate(args) {
        return knex(args.table_name).truncate();
    },
    select(args) {
        return args.data
            ? knex(args.table_name).select().where(args.data)
            : knex.select('*').from(args.table_name);
    },
    first(args) {
        return knex(args.table_name).where(args.filter).first();
    },
};
exports.default = Q;
//# sourceMappingURL=qbuilder.js.map