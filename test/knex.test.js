const seneca = require('seneca')
// const Shared = require('seneca-store-test')
const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())
const { describe, it, before } = lab
const { expect } = require('@hapi/code')
const Shared = require('seneca-store-test')

const KnexStore = require('../src/knex-store')
const DbConfig = require('./config/database/config')

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


describe('shared tests', () => {
  const senecaForTest = makeSenecaForTest()

  before(() => {
    return new Promise((done) => {
      senecaForTest.ready(done)
    })
  })

  describe('basic tests', () => {
    Shared.basictest({
      seneca: senecaForTest,
      senecaMerge: makeSenecaForTest({ postgres_opts: { merge: false } }),
      script: lab
    })
  })

})

describe('knex-store tests', function () {
  const senecaForTest = makeSenecaForTest()
  senecaForTest.use('promisify')

  before(() => {
    return new Promise((done) => {
      senecaForTest.ready(done)
    })
  })

  it('save', async () => {
    const foo_record = await knex('foo').first()
    expect(foo_record).to.be.an.object()
    expect(foo_record.x).to.equal(1)

    const s0 = await senecaForTest.entity.begin()
    await s0.entity('foo').data$({p1:'t1'}).save$()
    const tx0 = await s0.entity.end()

    expect(tx0).include({
      begin: { handle: { name: 'postgres' } },
      canon: {},
      handle: { name: 'postgres' },
      trace: [ { msg: {}, meta: {} } ],
      end: { done: true },
    })
  })

  it('load', async () => {
    const s0 = await senecaForTest.entity.begin()
    const rows = await s0.entity('foo').load$({p1:'t1'})
    await s0.entity.end()

    expect(rows.length).equal(1)
    expect(rows[0].p1).equal('t1')
  })

  it('list', async () => {
    const s0 = await senecaForTest.entity.begin()
    const rows = await s0.entity('foo').list$()
    await s0.entity.end()

    expect(rows.length).greaterThan(0)
    expect(rows[0].p1).equal('t1')

  })

  it('update', async () => {
    const s0 = await senecaForTest.entity.begin()
    const rows = await s0.entity('foo').list$()
    const idTest = rows[0].id
    
    const foo1 = await s0.entity('foo').data$({x: 5, id: idTest }).save$()

    expect(foo1).to.exist()
    expect(typeof foo1.id).to.equal('number')
    expect(foo1.x).to.equal(5)
  })

  it('remove', async () => {
    const s0 = await senecaForTest.entity.begin()
    const rows = await s0.entity('foo').list$()
    const idTest = rows[0].id
    await s0.entity('foo').data$({ x: 5, id: idTest }).remove$()

    const row = await s0.entity('foo').load$({id: idTest})

    expect(row).to.be.undefined()
  })
})

function makeSenecaForTest() {
  const si = seneca().test()

  si.use('seneca-entity', { mem_store: false })
  si.use(KnexStore, DbConfig)

  return si
}