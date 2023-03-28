const Seneca = require('seneca')
const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())
const { before, describe, it, beforeEach, afterEach } = lab
const { expect } = require('@hapi/code')
const Shared = require('seneca-store-test')
const Async = require('async')

const KnexStore = require('../src/knex-store')

const DbConfigPG = {
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5433,
    user: 'senecatest',
    password: 'senecatest_0102',
    database: 'senecatest_knex',
  },
}

const DbConfigSQLite = {
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5433,
    user: 'senecatest',
    password: 'senecatest_0102',
    database: 'senecatest_knex',
  },
}

describe('standard - postgres', () => {

  const senecaForTest = makeSenecaForTest(DbConfigPG)

  senecaStoreBasicTests(senecaForTest, DbConfigPG)

  senecaStoreSortTests(senecaForTest)

  senecaStoreLimitTests(senecaForTest)

  senecaStoreSQLTests(senecaForTest)

  // senecaStoreUpsertTests(senecaForTest)
})

describe('standard - sqlite', () => {

  const senecaForTest = makeSenecaForTest(DbConfigSQLite)

  senecaStoreBasicTests(senecaForTest, DbConfigSQLite)

  senecaStoreSortTests(senecaForTest)

  senecaStoreLimitTests(senecaForTest)

  senecaStoreSQLTests(senecaForTest)

  // senecaStoreUpsertTests(senecaForTest)
})

describe('smoke - postgres', function () {

  const senecaForTest = makeSenecaForTest(DbConfigPG)

  clearDb(senecaForTest)

  smokeTests(senecaForTest)
})

describe('smoke - sqlite', function () {

  const senecaForTest = makeSenecaForTest(DbConfigSQLite)

  clearDb(senecaForTest)

  smokeTests(senecaForTest)
})

function senecaStoreBasicTests(senecaForTest, DbConfig) {
  describe('basic tests', () => {
    Shared.basictest({
      seneca: senecaForTest,
      senecaMerge: makeSenecaForTest(DbConfig),
      script: lab,
    })
  })
}

function senecaStoreSortTests(senecaForTest) {
  describe('sort tests', () => {
    Shared.sorttest({
      seneca: senecaForTest,
      script: lab
    })
  })
}

function senecaStoreLimitTests(senecaForTest) {
  describe('limit tests', () => {
    Shared.limitstest({
      seneca: senecaForTest,
      script: lab
    })
  })
}

function senecaStoreSQLTests(senecaForTest) {
  describe('sql tests', () => {
    Shared.sqltest({
      seneca: senecaForTest,
      script: lab
    })
  })
}

// function senecaStoreUpsertTests(senecaForTest) {
//   describe('upsert tests', () => {
//     Shared.upserttest({
//       seneca: senecaForTest,
//       script: lab
//     })
//   })
// }

function smokeTests(senecaForTest) {
  let foo1_id

  it('save', async () => {
    const foo1 = await senecaForTest
      .entity('foo')
      .data$({ id: 'will-be-saved', p1: 'z1', p2: 'z2', p3: 'z3' })
      .save$()

    expect(foo1.id).to.exist()
    expect(typeof foo1.id).to.equal('string')
    expect(foo1.p1).to.equal('z1')
    expect(foo1.p2).to.equal('z2')
    expect(foo1.p3).to.equal('z3')

    foo1_id = foo1.id
  })

  it('load', async () => {
    const row = await senecaForTest.entity('foo').load$({ id: foo1_id })

    expect(row.p1).to.exist()
    expect(typeof row.p1).to.equal('string')
    expect(row.p1).to.equal('z1')
    expect(row.p2).to.equal('z2')
    expect(row.p3).to.equal('z3')
  })

  it('list', async () => {
    const rows = await senecaForTest.entity('foo').list$({})

    expect(rows.length).greaterThan(0)
  })

  it('filter', async () => {
    const row = await senecaForTest.entity('foo').load$({ p1: 'z1' })

    expect(row.p1).to.equal('z1')
    expect(row.p2).to.equal('z2')
    expect(row.p3).to.equal('z3')
  })

  it('update', async () => {
    const foo1 = await senecaForTest
      .entity('foo')
      .data$({ p1: 't4', id: foo1_id })
      .save$()

    expect(foo1.id).to.exist()
    expect(typeof foo1.id).to.equal('string')
    expect(foo1.p1).to.equal('t4')
  })

  it('remove', async () => {
    const del = await senecaForTest
      .entity('foo')
      .data$({ id: foo1_id })
      .remove$()

    expect(del).to.equal(null)
  })
}

describe('transaction', function () {
  const si = makeSenecaForTest(
    DbConfigPG, 
    {entity_opts: { transaction: {active:true} }
  })

  before(() => {
    return new Promise(done => {
      si.ready(done)
    })
  })

  beforeEach(clearDb(si))

  afterEach(clearDb(si))


  it('happy', async () => {

    const s0 = await si.entity.begin()
    await s0.entity('foo').data$({p1:'t1'}).save$()
    const tx0 = await s0.entity.end()
    
    const isCompleted = tx0.client.isCompleted()

    expect(tx0).include({result: { done: true }})
    expect(isCompleted).equal(true)

    let foos = await si.entity('foo').list$()
    expect(foos.length).equal(1)
    expect(foos[0].p1).equal('t1')
  })

  
  it('rollback', async () => {
    const s0 = await si.entity.begin()

    await s0.entity('foo').data$({p1:'t2'}).save$()

    const tx0 = await s0.entity.rollback()

    expect(tx0).include({result: { done: false, rollback: true }})

    let foos = await si.entity('foo').list$()
    expect(foos.length).equal(0)
  })


  it('rollback-on-error', async () => {
    si.message('foo:red', async function foo_red(msg) {
      await this.entity('foo').data$({p1:'t1'}).save$()
      throw new Error('BAD')
    })

    let s0 = await si.entity.begin()
    
    try {
      await s0.post('foo:red')
    }
    catch(err) {
      expect(err.message).equal('seneca: Action foo:red failed: BAD.')
      let foos = await s0.entity('foo').list$()
      expect(foos.length).equal(0)
    
      let t0 = s0.entity.state()
      expect(t0.transaction.trace.length).equal(1)

      return
    }

    throw new Error('expected the call to throw')
  })
})

function makeSenecaForTest(DbConfig, opts = {}) {
  const si = Seneca().test()

  const { entity_opts = {} , postgres_opts = {} } = opts

  si.use('promisify')
  si.use('seneca-entity', { 
    mem_store: false,
    ...entity_opts, 
  })
  
  si.use(KnexStore, { ...DbConfig, ...postgres_opts})

  return si
}

function clearDb(si) {
  return () =>
    new Promise((done) => {
      Async.series(
        [
          function clearFoo(next) {
            si.make('foo').remove$({ all$: true }, next)
          },

          function clearBar(next) {
            si.make('zen', 'moon', 'bar').remove$({ all$: true }, next)
          },

          function clearProduct(next) {
            si.make('products').remove$({ all$: true }, next)
          },

          function clearAutoIncrementors(next) {
            si.make('auto_incrementors').remove$({ all$: true }, next)
          },
        ],
        done
      )
    })
}
