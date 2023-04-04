const Seneca = require('seneca')
const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())
const { before, describe, it, beforeEach, afterEach } = lab
const { expect } = require('@hapi/code')
const Shared = require('seneca-store-test')
const Async = require('async')
const knex = require('knex')

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


  it('adopt-commit', async () => {
    let fooKnexTest_id
    let foo1_id
    let foo2_id

    const trx = await knex(DbConfigPG).transaction()

    //Testing Knex client directly using the transaction
    trx('foo').insert({p1:'tx'}).returning('*').then(trx.commit)
    .then((result) => {
      expect(result[0].p1).equal('tx')
      fooKnexTest_id = result[0].id
    })

    //I'm using the same Knex instance directly to delete the row created above
    trx('foo').where('id', fooKnexTest_id).del().then(trx.commit)
    .then((result) => {
      //Knex returns the number of rows deleted
      expect(result).equal(1)
    })

    const txseneca  = await si.entity.adopt({handle:trx})

    //I'm checking the state of the transaction inside seneca, if it exists...
    const isTransaction = !!txseneca.entity.state().transaction
    expect(isTransaction).equal(true)

    //I'm using the same Knex instance....
    const foo1 = await txseneca.entity('foo').data$({p1:'t1'}).save$()
    foo1_id = foo1.id
    const foo2 = await txseneca.entity('foo').data$({p1:'t2'}).save$()
    foo2_id = foo2.id
    
    //I'm checking the state of the transaction, I have not committed yet
    //so isCompleted should be false and the list should be empty
    const isCompleted1 = txseneca.client.isCompleted()
    expect(isCompleted1).equal(false)
    let listFoo1 = await si.entity('foo').list$()
    expect(listFoo1.length).equal(0)
    
    //I'm updating the second element, using the same Knex instance
    await txseneca.entity('foo').
    data$({ p1: 't3', id: foo2_id })
    .save$()

    //I have not committed yet, so the list should be empty
    let listFoo2 = await si.entity('foo').list$()
    expect(listFoo2.length).equal(0)

    //I'm removing the first element, using the same Knex instance
    await txseneca.entity('foo')
    .data$({ id: foo1_id })
    .remove$()

    //I'm committing the transaction, using the same Knex instance
    //So I'm expecting the first element to be removed and the second
    //only element available to be t3 (the updated value)
    const tx1 = await txseneca.entity.end()
    let foosCommit = await si.entity('foo').list$()
    expect(foosCommit.length).equal(1)
    expect(foosCommit[1].p1).equal('t3')

    //I'm checking the state of the transaction, I have committed
    //so isCompleted should be true
    const isCompleted2 = tx1.client.isCompleted()
    expect(isCompleted2).equal(true)

  })

  it('adopt-knex-direct', async () => {
    //Creating Knex instance directly to insert a row
    const trx = await knex(DbConfigPG).transaction()

    //Testing Knex client directly using the transaction, I'm inserting a row
    trx('foo').insert({p1:'tx'}).returning('*').then(trx.commit)
    .then((result) => {
      expect(result[0].p1).equal('tx')
    })

    //I'm using the same Knex instance directly to list the rows
    trx('foo').select('*').then(trx.commit)
    .then((result) => {
      expect(result.length).equal(1)
    })
    
    //I'm using the same Knex instance directly to delete the row created above
    trx('foo').where('p1', 'tx').del().then(trx.commit)
    .then((result) => {
      expect(result).equal(1)
    })

    //Same Knex instance directly to list the rows, it should be empty
    trx('foo').select('*').then(trx.commit)
    .then((result) => {
      expect(result.length).equal(0)
    })

    //Testing reusability of the same Knex instance
    await trx('foo').insert({p1:'tx'})
    await trx('foo').insert({p1:'tx1'})
    await trx('foo').insert({p1:'tx2'})
    await trx('foo').insert({p1:'tx3'})
    await trx.commit()

    //Same Knex instance directly to list the rows, it should be 4
    trx('foo').select('*').then(trx.commit).then((result) => {
      expect(result.length).equal(4)
    })
  })


  it('adopt-rollback', async () => {
    const trx = await knex(DbConfigPG).transaction()

    //Testing Knex client directly using the transaction, I'm inserting a row
    //And then I'm rolling back the transaction
    trx('foo').insert({p1:'tx'}).returning('*').then(trx.rollback)
    .then((result) => {
      expect(result[0].p1).not.equal('tx')
    })

    const txseneca = await si.entity.adopt({handle:trx})

    //I'm checking the state of the transaction inside seneca, if it exists...
    const isTransaction = !!txseneca.entity.state().transaction
    expect(isTransaction).equal(true)

    //I'm using the same Knex instance....
    const foo1 = await txseneca.entity('foo').data$({p1:'t1'}).save$()
    await txseneca.entity.rollback()
    expect(foo1.id).equal(undefined)
    const foo2 = await txseneca.entity('foo').data$({p1:'t2'}).save$()
    await txseneca.entity.rollback()
    expect(foo2.id).equal(undefined)
    
    //I'm checking the state of the transaction, I have not committed yet
    //so isCompleted should be true and the list should be empty
    const isCompleted1 = txseneca.client.isCompleted()
    expect(isCompleted1).equal(true)
    let listFoo1 = await si.entity('foo').list$()
    expect(listFoo1.length).equal(0)

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
