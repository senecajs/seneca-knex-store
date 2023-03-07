const knex = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5433,
    user: 'senecatest',
    password: 'senecatest_0102',
    database: 'senecatest_knex',
  }
})

const Q = {
  upsert(args: { table_name: string; data: any; id: string }) {
    return knex(args.table_name).upsert(args.data, args.id)
  },
  update(args: { table_name: string; data: any }) {
    return knex(args.table_name).update(args.data).where(args.data.id)
  },
  insert(args: { table_name: string; data: any }) {
    return knex(args.table_name).insert(args.data)
  },
  delete(args: { table_name: string; id: string }) {
    return knex(args.table_name).delete().where(args.id)
  },
  select(args: { table_name: string}) {
    return knex().select().from(args.table_name)
  },
  first(args: { table_name: string; id: string }) {
    return knex(args.table_name).first().where(args.id)
  },
}

export default Q