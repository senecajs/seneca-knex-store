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
  update(args: { table_name: string; data: any; id: string }) {
    return knex(args.table_name)
      .where({ id: args.id })
      .update(args.data)
      .returning('*')
  },
  insert(args: { table_name: string; data: any }) {
    return knex(args.table_name).insert(args.data).returning('*')
  },
  delete(args: { table_name: string; filter: string, isLoadDeleted: boolean }) {
    if (args.isLoadDeleted){
      return knex(args.table_name).where(args.filter).del().returning('*')
    }
    return knex(args.table_name).where(args.filter).del()
  },
  truncate(args: { table_name: string }) {
    return knex(args.table_name).truncate()
  },
  select(args: { table_name: string; data: any, isArray: boolean }) {
    if(args.isArray){
      return knex(args.table_name).whereIn('id', args.data)
    }
    return args.data
      ? knex(args.table_name).select().where(args.data)
      : knex.select('*').from(args.table_name)
  },
  first(args: { table_name: string; filter: any }) {
    return knex(args.table_name).where(args.filter).first()
  },
}

export default Q
