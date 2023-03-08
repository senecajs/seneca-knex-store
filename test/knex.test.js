const seneca = require('seneca')
const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())
const { describe, it, before } = lab
const { expect } = require('@hapi/code')
// const Shared = require('seneca-store-test')

const KnexStore = require('../src/knex-store')
const DbConfig = require('./config/database/config')


// describe('shared tests', () => {
//   const senecaForTest = makeSenecaForTest()

//   before(() => {
//     return new Promise((done) => {
//       senecaForTest.ready(done)
//     })
//   })

//   describe('basic tests', () => {
//     Shared.basictest({
//       seneca: senecaForTest,
//       senecaMerge: makeSenecaForTest({ postgres_opts: { merge: false } }),
//       script: lab
//     })
//   })

// })

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
    await s0.entity.end()
    
    expect(foo1.id).to.exist()
    expect(typeof foo1.id).to.equal('string')
    expect(foo1.p1).to.equal('t1')

    idTest = foo1.id
  })

  it('load', async () => {
    const s0 = await senecaForTest.entity.begin()
    const rows = await s0.entity('foo').load$({id: idTest})

    expect(rows.length).equal(1)
    expect(rows[0].p1).equal('t1')
  })

  it('list', async () => {
    const s0 = await senecaForTest.entity.begin()
    const rows = await s0.entity('foo').list$()

    expect(rows.length).greaterThan(0)
    expect(rows[0].p1).equal('t1')

  })

  it('update', async () => {
    const s0 = await senecaForTest.entity.begin()    
    const foo1 = await s0.entity('foo').data$({x: 5, id: idTest }).save$()

    expect(foo1).to.exist()
    expect(typeof foo1.id).to.equal('number')
    expect(foo1.x).to.equal(5)
  })

  it('remove', async () => {
    const s0 = await senecaForTest.entity.begin()
    await s0.entity('foo').data$({id: idTest }).remove$()

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