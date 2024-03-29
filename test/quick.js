// const DbConfig = require('./config/database/config')
const Seneca = require('seneca')

run()

async function run() {
  const configDB = {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      port: 5433,
      user: 'senecatest',
      password: 'senecatest_0102',
      database: 'senecatest_knex',
    },
  }

  const seneca = Seneca()
    .test()
    .use('promisify')
    .use('entity')
    .use('..', configDB)

  await seneca.ready()

  const foo0 = await seneca.entity('foo').data$({ id$: 'f0', x: 0 }).save$()
  console.log(foo0)

  const foo1 = await seneca.entity('foo').data$({ x: 1 }).save$()
  console.log(foo1)

  const foo2 = await seneca.entity('foo').data$({ x: 2 }).save$()
  console.log(foo2)

  const list = await seneca.entity('foo').list$()
  console.log(list)
}
