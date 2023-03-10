const seneca = require('seneca')
const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())
const { describe, it, before } = lab
const { expect } = require('@hapi/code')
const Shared = require('seneca-store-test')

const KnexStore = require('../src/knex-store')
const DbConfig = require('./config/database/config')


describe('shared tests', () => {
  const senecaForTest = makeSenecaForTest()

  before(() => {
    return new Promise(done => {
      senecaForTest.ready(done)
    })
  })

  describe('basic tests', () => {
    Shared.basictest({
      seneca: senecaForTest,
      senecaMerge: makeSenecaForTest(),
      script: lab
    })
  })

  describe('sort tests', () => {
    Shared.sorttest({
      seneca: senecaForTest,
      script: lab
    })
  })

  describe('limit tests', () => {
    Shared.limitstest({
      seneca: senecaForTest,
      script: lab
    })
  })

  describe('sql tests', () => {
    Shared.sqltest({
      seneca: senecaForTest,
      script: lab
    })
  })

  describe('upsert tests', () => {
    Shared.upserttest({
      seneca: senecaForTest,
      script: lab
    })
  })
})

describe('knex-store tests', function () {
  const senecaForTest = makeSenecaForTest()
  senecaForTest.use('promisify')

  let idTest

  before(() => {
    return new Promise((done) => {
      senecaForTest.ready(done)
    })
  })

  it('save', async () => {
    const s0 = await senecaForTest.entity.begin()
    const foo1 = await s0.entity('foo').data$({p1:'t1'}).save$()
    
    expect(foo1[0].id).to.exist()
    expect(typeof foo1[0].id).to.equal('string')
    expect(foo1[0].p1).to.equal('t1')

    idTest = foo1[0].id
  })

  it('load', async () => {
    const s0 = await senecaForTest.entity.begin()
    const row = await s0.entity('foo').load$({id: idTest})

    expect(row.p1).to.exist()
    expect(typeof row.p1).to.equal('string')
    expect(row.p1).equal('t1')
  })

  it('list', async () => {
    const s0 = await senecaForTest.entity.begin()
    const rows = await s0.entity('foo').list$()

    expect(rows.length).greaterThan(0)
    expect(rows[0].p1).equal('t1')

  })

  it('update', async () => {
    const s0 = await senecaForTest.entity.begin()    
    const foo1 = await s0.entity('foo').data$({p1: 't4', id: idTest }).save$()

    expect(foo1[0].id).to.exist()
    expect(typeof foo1[0].id).to.equal('string')
    expect(foo1[0].p1).to.equal('t4')
  })

  it('remove', async () => {
    const s0 = await senecaForTest.entity.begin()
    const del = await s0.entity('foo').data$({id: idTest }).remove$()

    expect(del.delete).to.equal(true)
  })
})

function makeSenecaForTest() {
  const si = seneca().test()

  si.use('seneca-entity', { mem_store: false })
  si.use(KnexStore, DbConfig)

  return si
}