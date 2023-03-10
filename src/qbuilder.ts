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
})

const Q = {
  upsert(args: { table_name: string; data: any; id: string }) {
    return knex(args.table_name).upsert(args.data, args.id)
  },
  update(args: { table_name: string; data: any, id: string }) {
    return knex(args.table_name).where({id: args.id}).update(args.data).returning('*')
  },
  insert(args: { table_name: string; data: any }) {
    return knex(args.table_name).insert(args.data).returning('*')
  },
  delete(args: { table_name: string; id: string }) {
    return knex(args.table_name).where({id: args.id}).del()
  },
  select(args: { table_name: string}) {
    return knex.select('*').from(args.table_name)
  },
  first(args: { table_name: string; id: string }) {
    return knex(args.table_name).where({id: args.id}).first()
  },
}

export default Q