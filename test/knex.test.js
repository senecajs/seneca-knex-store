const Seneca = require('seneca')
const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())
const { describe, it } = lab
const { expect } = require('@hapi/code')
const Shared = require('seneca-store-test')
// const Async = require('async')

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

//   // describe('sort tests', () => {
//   //   Shared.sorttest({
//   //     seneca: senecaForTest,
//   //     script: lab
//   //   })
//   // })

//   // describe('limit tests', () => {
//   //   Shared.limitstest({
//   //     seneca: senecaForTest,
//   //     script: lab
//   //   })
//   // })

//   // describe('sql tests', () => {
//   //   Shared.sqltest({
//   //     seneca: senecaForTest,
//   //     script: lab
//   //   })
//   // })

//   // describe('upsert tests', () => {
//   //   Shared.upserttest({
//   //     seneca: senecaForTest,
//   //     script: lab
//   //   })
//   // })
})

describe('smoke', function () {
  const senecaForTest = makeSenecaForTest()

  let foo1_id

  it('save', async () => {
    const foo1 = await senecaForTest.entity('foo')
    .data$({id: 'will-be-inserted', p1:'z1', p2:'z2', p3: 'z3'}).save$()

    expect(foo1.id).to.exist()
    expect(typeof foo1.id).to.equal('string')
    expect(foo1.p1).to.equal('v1')
    expect(foo1.p2).to.equal('z2')
    expect(foo1.p3).to.equal('z3')

    foo1_id = foo1.id
  })

  it('load', async () => {
    const row = await senecaForTest.entity('foo').load$({id: foo1_id})

    expect(row.p1).to.exist()
    expect(typeof row.p1).to.equal('string')
    expect(row.p1).to.equal('v1')
    expect(row.p2).to.equal('z2')
    expect(row.p3).to.equal('z3')
  })

  it('list', async () => {
    const rows = await senecaForTest.entity('foo').list$({})

    expect(rows.length).greaterThan(0)

  })

  it('filter', async () => {
    const row = await senecaForTest.entity('foo').load$({p1: 'v2'})

    expect(row.p1).to.equal('v1')
    expect(row.p2).to.equal('z2')
    expect(row.p3).to.equal('z3')

  })

  it('update', async () => {
    const foo1 = await senecaForTest.entity('foo')
    .data$({p1: 't4', id: foo1_id }).save$()

    expect(foo1.id).to.exist()
    expect(typeof foo1.id).to.equal('string')
    expect(foo1.p1).to.equal('t4')
  })

  it('remove', async () => {
    const del = await senecaForTest.entity('foo')
    .data$({id: foo1_id }).remove$()

    expect(del.delete).to.equal(true)
  })

})

function makeSenecaForTest() {
  const si = Seneca().test()

  si.use('promisify')
  si.use('entity', { mem_store: false })
  si.use(KnexStore, DbConfig)

  return si
}

// function clearDb(si) {
//   return () => new Promise(done => {
//     Async.series([
//       function clearFoo(next) {
//         si.make('foo').remove$({ all$: true }, next)
//       },

//       function clearBar(next) {
//         si.make('zen', 'moon', 'bar').remove$({ all$: true }, next)
//       },

//       function clearProduct(next) {
//         si.make('products').remove$({ all$: true }, next)
//       },

//       function clearAutoIncrementors(next) {
//         si.make('auto_incrementors').remove$({ all$: true }, next)
//       }
//     ], done)
//   })
// }