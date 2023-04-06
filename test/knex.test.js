const Seneca = require('seneca')
const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())
const { before, describe, it, beforeEach, afterEach } = lab
const { expect } = require('@hapi/code')
const Shared = require('seneca-store-test')
const Async = require('async')
const Knex = require('knex')

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

    const s0 = await si.entity.transaction()
    // console.log(s0.entity.state())
    
    const foo1 = await s0.entity('foo').data$({p1:'t1'}).save$()
    
    const tx0 = await s0.entity.commit()

    const isCompleted = tx0.handle.isCompleted()

    expect(tx0).include({result: { done: true }})
    expect(isCompleted).equal(true)

    let foos = await si.entity('foo').list$()
    expect(foos.length).equal(1)
    expect(foos[0].p1).equal('t1')
  })

  
  it('rollback-direct', async () => {
    const s0 = await si.entity.transaction()
    let txid = s0.entity.state().transaction.id
    expect(txid).exists()
    
    await s0.entity('foo').data$({p1:'t2'}).save$()

    let foos = await s0.entity('foo').list$()
    expect(foos.length).equal(1)

    // not visible outside tx
    foos = await si.entity('foo').list$()
    expect(foos.length).equal(0)

    
    const txr0 = await s0.entity.rollback()
    expect(txr0.id).equal(txid)
    
    expect(txr0).include({result: { done: false, rollback: true }})

    foos = await si.entity('foo').list$()
    expect(foos.length).equal(0)

    // idempotent
    const txe0 = await s0.entity.commit()
    expect(txe0.id).equal(txid)

    foos = await si.entity('foo').list$()
    expect(foos.length).equal(0)
  })


  it('rollback-on-error', async () => {
    si.message('foo:red', async function foo_red(msg) {
      await this.entity('foo').data$({p1:'t1'}).save$()
      throw new Error('BAD')
    })

    let s0 = await si.entity.transaction()
    let txid = s0.entity.state().transaction.id
    expect(txid).exists()
    
    try {
      await s0.post('foo:red')
    }
    catch(err) {
      expect(err.message).equal('seneca: Action foo:red failed: BAD.')

      let t0e = s0.entity.state()
      expect(t0e.transaction.id).equal(txid)

      let foos = await si.entity('foo').list$()
      expect(foos.length).equal(0)

      // idempotent
      const txe0 = await s0.entity.commit()
      expect(txe0.id).equal(txid)
      
      foos = await si.entity('foo').list$()
      expect(foos.length).equal(0)

      return
    }

    throw new Error('expected the call to throw')
  })

  
  
  it('adopt-happy', async () => {
    const trx = await Knex(DbConfigPG).transaction()

    const foo0s = await trx('foo')
          .insert({p1:'t0', id: 't0'})
          .returning('*')
    expect(foo0s[0].p1).equal('t0')
    
    const s0  = await si.entity.adopt(trx)
    const foo1 = await s0.entity('foo').data$({p1:'t1'}).save$()
    
    const tx0 = await s0.entity.commit()

    const isCompleted = tx0.handle.isCompleted()

    expect(tx0).include({result: { done: true }})
    expect(isCompleted).equal(true)

    let foos = await si.entity('foo').list$()
    expect(foos.length).equal(2)
    // console.log(foos)
    expect(foos[0].p1).equal('t0')
    expect(foos[1].p1).equal('t1')
  })

  it('adopt-rollback', async () => {
    const trx = await Knex(DbConfigPG).transaction()
    
    const s0  = await si.entity.adopt(trx)

    let txid = s0.entity.state().transaction.id
    expect(txid).exists()
    
    await s0.entity('foo').data$({p1:'t2'}).save$()

    let foos = await s0.entity('foo').list$()
    expect(foos.length).equal(1)

    foos = await si.entity('foo').list$()
    expect(foos.length).equal(0)
    
    const txr0 = await s0.entity.rollback()
    expect(txr0.id).equal(txid)
    
    expect(txr0).include({result: { done: false, rollback: true }})

    foos = await si.entity('foo').list$()
    expect(foos.length).equal(0)

    const txe0 = await s0.entity.commit()
    expect(txe0.id).equal(txid)

    foos = await si.entity('foo').list$()
    expect(foos.length).equal(0)
  })

  it('adopt-rollback-on-error', async () => {
    const trx = await Knex(DbConfigPG).transaction()
    
    si.message('foo:red', async function foo_red(msg) {
      await this.entity('foo').data$({p1:'t1'}).save$()
      throw new Error('BAD')
    })
    
    const s0  = await si.entity.adopt(trx)

    let txid = s0.entity.state().transaction.id
    expect(txid).exists()
    
    try {
      await s0.post('foo:red')
    }
    catch(err) {
      expect(err.message).equal('seneca: Action foo:red failed: BAD.')

      let t0e = s0.entity.state()
      expect(t0e.transaction.id).equal(txid)

      let foos = await si.entity('foo').list$()
      expect(foos.length).equal(0)

      // idempotent
      const txe0 = await s0.entity.commit()
      expect(txe0.id).equal(txid)
      
      foos = await si.entity('foo').list$()
      expect(foos.length).equal(0)

      return
    }

    throw new Error('expected the call to throw')
  })


  it('adopt-rollback-direct', async () => {
    const trx = await Knex(DbConfigPG).transaction()

    const foo0s = await trx('foo')
          .insert({p1:'t0', id: 't0'})
          .returning('*')
    expect(foo0s[0].p1).equal('t0')

    trx.rollback()

    const isCompleted = await trx.isCompleted()
    expect(isCompleted).equal(true)

    const foo1s = await Knex(DbConfigPG).select('*').from('foo')
    expect(foo1s.length).equal(0)

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
