// Save, load, list and remove an entity in Postgres through Knex.
// Start the database first: npm run services:up
const Seneca = require('seneca')

const seneca = Seneca({ legacy: false })
  .test()
  .use('promisify')
  .use('entity', { mem_store: false })
  .use(require('../..'), {
    client: 'pg',
    connection: {
      host: process.env.SENECA_TEST_PG_HOST || '127.0.0.1',
      port: parseInt(process.env.SENECA_TEST_PG_PORT || '55433', 10),
      user: 'senecatest',
      password: 'senecatest_0102',
      database: 'senecatest_knex',
    },
  })

seneca.ready(async function () {
  // The foo table is created by test/config/docker/dbschema.sql.
  const saved = await seneca
    .entity('foo')
    .data$({ id$: 'example-1', p1: 'apple', x: 1 })
    .save$()
  console.log('saved', saved.id, saved.p1)

  const loaded = await seneca.entity('foo').load$('example-1')
  console.log('loaded', loaded.id, loaded.p1, loaded.x)

  const list = await seneca.entity('foo').list$({ p1: 'apple' })
  console.log('listed', list.length)

  await seneca.entity('foo').remove$('example-1')
  console.log('removed', null == (await seneca.entity('foo').load$('example-1')))

  seneca.close(function () {
    console.log('closed')
  })
})
