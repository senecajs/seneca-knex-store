
const knex = require('knex')({
    client: 'pg',
    connection: {
        host : '127.0.0.1',
        port : 5433,
        user : 'senecatest',
        password : 'senecatest_0102',
        database : 'senecatest_knex'
    },
    debug: true
});

const Q = {
    upsert(args: { table_name: string, data: any, id: string }){          
        knex(args.table_name)
        .upsert(args.data, args.id)
        .then(
            knex.select('*').from(args.table_name)
            .then((res: any) => res)
        )
    },
    update(args: { table_name: string, data: any }){
        knex(args.table_name)
        .update(args.data)
        .where(args.data.id)
        .then(
            knex.select('*').from(args.table_name)
            .then((res: any) => res)
        )
    },
    insert(args: { table_name: string, data: any}){
        knex(args.table_name)
        .insert(args.data)
        .then(
            knex.select('*').from(args.table_name)
            .then((res: any) => res)
        )
    },
    delete(args: { table_name: string, id: string }){
        knex(args.table_name)
        .delete()
        .where(args.id)
        .then(
            knex.select('*').from(args.table_name)
            .then((res: any) => res)
        )
    },
    select(args: { table_name: string, id: string }){
        knex(args.table_name)
        .select()
        .where(args.id)        
        .then(
            knex.select('*').from(args.table_name)
            .then((res: any) => res)
        )
    },
    first(args: { table_name: string, id: string }){
        knex(args.table_name)
        .first()
        .where(args.id)
        .then(
            knex.select('*').from(args.table_name)
            .then((res: any) => res)
        )
    },
}

export default Q