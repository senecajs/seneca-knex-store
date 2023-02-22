interface knex_query {
    upsert(args: { table_name: string, data: any, id: string }): void
    update(args: { table_name: string, data: any, id: string }): void
    insert(args: { table_name: string, data: any }): void
    delete(args: { table_name: string, id: string }): void
    select(args: { table_name: string, id: string }): void
}

const Q = {
    upsert(args: { table_name: string, data: any, id: string }, knex: any){          
        knex(args.table_name)
        .upsert(args.data, args.id)
    },
    update(args: { table_name: string, data: any, id: string }, knex: any){
        knex(args.table_name)
        .update(args.data)
        .where(args.id)
    },
    insert(args: { table_name: string, data: any }, knex: any){
        knex(args.table_name)
        .insert(args.data)
    },
    delete(args: { table_name: string, id: string }, knex: any){
        knex(args.table_name)
        .delete()
        .where(args.id)
    },
    select(args: { table_name: string, id: string }, knex: any){
        knex(args.table_name)
        .select()
        .where(args.id)
    },
    first(args: { table_name: string, id: string }, knex: any){
        knex(args.table_name)
        .first()
        .where(args.id)
    },
}

const transactionQuery = {
    upsert(args: { table_name: string, data: any, id: string }, knex: any){
        knex.transaction(function(trx: any) {
            knex(args.table_name)
            .transacting(trx)
            .upsert(args.data, args.id)
            .then(trx.commit)
            .catch(trx.rollback)
        })
    },
    update(args: { table_name: string, data: any, id: string }, knex: any){
        knex.transaction(function(trx: any) {
            knex(args.table_name)
            .transacting(trx)
            .update(args.data)
            .where(args.id)
            .then(trx.commit)
            .catch(trx.rollback)
        })
    },
    insert(args: { table_name: string, data: any }, knex: any){
        knex.transaction(function(trx: any) {
            knex(args.table_name)
            .transacting(trx)
            .insert(args.data)
            .then(trx.commit)
            .catch(trx.rollback)
        })
    },
    delete(args: { table_name: string, id: string }, knex: any){
        knex.transaction(function(trx: any) {
            knex(args.table_name)
            .transacting(trx)
            .delete()
            .where(args.id)
            .then(trx.commit)
            .catch(trx.rollback)
        })
    },
    select(args: { table_name: string, id: string }, knex: any){
        knex.transaction(function(trx: any) {
            knex(args.table_name)
            .transacting(trx)
            .select()
            .where(args.id)
            .then(trx.commit)
            .catch(trx.rollback)
        })
    },
    first(args: { table_name: string, id: string }, knex: any){
        knex.transaction(function(trx: any) {
            knex(args.table_name)
            .transacting(trx)
            .first()
            .where(args.id)
            .then(trx.commit)
            .catch(trx.rollback)
        })
    }
}

module.exports = { Q, transactionQuery}