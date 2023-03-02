const seneca = require('seneca')
// const Shared = require('seneca-store-test')
const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())
const { describe, it, before } = lab
const { expect } = require('@hapi/code')

const KnexStore = require('../src/knex-store')
const DbConfig = require('./config/database/config')

describe('knex-store tests', function () {
  const test = seneca()
    .test()
    .use('entity')
    .use(KnexStore, { DbConfig })
    .use('promisify')

  console.log(test)

  before(() => {
    return new Promise((done) => {
      seneca().ready(done)
    })
  })

  it('save', async () => {
    const s0 = await seneca().entity().begin()
    console.log(s0)
    const foo1 = await s0.entity('foo').data$({ x: 1 }).save$()
    console.log(foo1)
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
    const s0 = await seneca().entity.begin()
    console.log(s0)
    let rows = seneca.entity('foo').list$()
    console.log(rows) /// lists rows

    expect(rows.length).equal(1)
    expect(rows[0].x).equal('1')
  })

  it('update', async () => {
    const s0 = await seneca().entity.begin()
    console.log(s0)
    const foo1 = await s0.entity('foo').data$({ x: 5 }).save$()
    console.log(foo1)

    expect('foo').to.exist()
    expect(typeof 'foo'.id).to.equal('number')
    expect('foo'.x).to.equal(5)
  })

  it('remove', async () => {
    const s0 = await seneca().entity.begin()
    console.log(s0)
    const foo1 = await s0.entity('foo').data$({ x: 5 }).remove$()
    console.log(foo1)

    expect('foo').to.exist()
    expect(typeof 'foo'.id).to.equal('number')
    expect('foo'.x).to.be.false
  })
})
