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
  
  const s0 = await seneca.entity.begin()

  const test = await s0.entity('foo').data$({p1:'t2'}).save$()
  console.log('test', test)

  const tx0 = await s0.entity.rollback()
  console.log('tx0', tx0)

  const isCompleted = tx0.handle.isCompleted()
  console.log('isCompleted', isCompleted)


  let foos = await seneca.entity('foo').list$()
  console.log("foos", foos)
  debugger
}