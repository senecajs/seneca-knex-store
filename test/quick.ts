const seneca = require('seneca')
// const Shared = require('seneca-store-test')

const KnexStore = require('../src/knex-store')
const DbConfig = require('./config/database/config')


  const test = seneca()
    .test()
    .use('entity')
    .use(KnexStore, { DbConfig })
    .use('promisify')

  console.log(test)

  async function awaitSeneca() {
      await seneca().ready()
  }

   async function quickSave() {
    const s0 = await seneca().entity().begin()
    console.log(s0)
    const foo1 = await s0.entity('foo').data$({ x: 1 }).save$()
    console.log(foo1)
  }

  async function quickList() {
    const s0 = await seneca().entity.begin()
    console.log(s0)
    let rows = seneca.entity('foo').list$()
    console.log(rows) /// lists rows
  }

  async function quickUpdate() {
    const s0 = await seneca().entity.begin()
    console.log(s0)
    const foo1 = await s0.entity('foo').data$({ x: 5 }).save$()
    console.log(foo1)
  }

  async function quickRemove() {
    const s0 = await seneca().entity.begin()
    console.log(s0)
    const foo1 = await s0.entity('foo').data$({ x: 5 }).remove$()
    console.log(foo1)
  }

  (async () => {
    await awaitSeneca()
    await quickSave()
    await quickList()
    await quickUpdate()
    await quickRemove()
    console.log('done')
  })()
