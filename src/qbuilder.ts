
const knex = require('knex')({
    client: 'pg',
    connection: {
        host : '127.0.0.1',
        port : 5432,
        user : 'senecatest',
        password : 'senecatest_0102',
        database : 'senecatest_knex'
    }
});

interface knex_query {
    upsert(args: { table_name: string, data: any, id: string }): void
    update(args: { table_name: string, data: any, id: string }): void
    insert(args: { table_name: string, data: any }): void
    delete(args: { table_name: string, id: string }): void
    select(args: { table_name: string, id: string }): void
}

const Q = {
    upsert(args: { table_name: string, data: any, id: string }){          
        knex(args.table_name)
        .upsert(args.data, args.id)
    },
    update(args: { table_name: string, data: any, id: string }){
        knex(args.table_name)
        .update(args.data)
        .where(args.id)
    },
    insert(args: { table_name: string, data: any }){
        knex(args.table_name)
        .insert(args.data)
    },
    delete(args: { table_name: string, id: string }){
        knex(args.table_name)
        .delete()
        .where(args.id)
    },
    select(args: { table_name: string, id: string }){
        knex(args.table_name)
        .select()
        .where(args.id)
    },
    first(args: { table_name: string, id: string }){
        knex(args.table_name)
        .first()
        .where(args.id)
    },
}

export default Q