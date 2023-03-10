const Seneca = require('seneca')
const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())
const { describe, it } = lab
const { expect } = require('@hapi/code')
const Shared = require('seneca-store-test')

const KnexStore = require('../src/knex-store')
const DbConfig = require('./config/database/config')


describe('standard', () => {
  const senecaForTest = makeSenecaForTest()

  describe('basic tests', () => {
    Shared.basictest({
      seneca: senecaForTest,
      senecaMerge: makeSenecaForTest(),
      script: lab
    })
  })

  // describe('sort tests', () => {
  //   Shared.sorttest({
  //     seneca: senecaForTest,
  //     script: lab
  //   })
  // })

  // describe('limit tests', () => {
  //   Shared.limitstest({
  //     seneca: senecaForTest,
  //     script: lab
  //   })
  // })

  // describe('sql tests', () => {
  //   Shared.sqltest({
  //     seneca: senecaForTest,
  //     script: lab
  //   })
  // })

  // describe('upsert tests', () => {
  //   Shared.upserttest({
  //     seneca: senecaForTest,
  //     script: lab
  //   })
  // })
})

describe('smoke', function () {
  const senecaForTest = makeSenecaForTest()

  let foo1_id

  it('save', async () => {
    const foo1 = await senecaForTest.entity('foo').data$({p1:'t1'}).save$()
    
    expect(foo1[0].id).to.exist()
    expect(typeof foo1[0].id).to.equal('string')
    expect(foo1[0].p1).to.equal('t1')

    foo1_id = foo1[0].id
  })

  it('load', async () => {
    const row = await senecaForTest.entity('foo').load$({id: foo1_id})

    expect(row.p1).to.exist()
    expect(typeof row.p1).to.equal('string')
    expect(row.p1).equal('t1')
  })

  it('list', async () => {
    const rows = await senecaForTest.entity('foo').list$()

    expect(rows.length).greaterThan(0)
    expect(rows[0].p1).equal('t1')

  })

  it('update', async () => {
    const foo1 = await senecaForTest.entity('foo')
    .data$({p1: 't4', id: foo1_id }).save$()

    expect(foo1[0].id).to.exist()
    expect(typeof foo1[0].id).to.equal('string')
    expect(foo1[0].p1).to.equal('t4')
  })

  it('remove', async () => {
    const del = await senecaForTest.entity('foo')
    .data$({id: foo1_id }).remove$()

    expect(del.delete).to.equal(true)
  })

  // it('removeAll', async () => {
  //   const s0 = await senecaForTest.entity.begin()
  //   const del = await s0.entity('foo').data$({id: idTest }).remove$()

  //   expect(del.delete).to.equal(true)
  // })
})

function makeSenecaForTest() {
  const si = Seneca().test()

  si.use('promisify')
  si.use('entity', { mem_store: false })
  si.use(KnexStore, DbConfig)

  return si
}