/*
  MIT License,
  Copyright (c) 2010-2022, Richard Rodger and other contributors.
*/

'use strict'

const Seneca = require('seneca')
const Shared = require('seneca-store-test')

const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())

//TO DO - KNEX TESTS

const seneca = Seneca({
  log: 'silent',
  default_plugins: { 'knex-store': false },
})
seneca.use({ name: '..', tag: '1' })

const senecaMerge = Seneca({
  log: 'silent',
})
senecaMerge.use({ name: '..', tag: '1' }, { merge: false })

if ('2.0.0' <= seneca.version) {
  seneca.use('entity', { knex: false })
  senecaMerge.use('entity', { knex_store: false })
}

const seneca_test = Seneca() // ({ require })
  .test()
  .use('promisify')
  .use('entity', { knex_store: false })
//.use('..')

const test_opts = {
  seneca: seneca_test,
  name: 'knex-store',
}

Shared.test.init(lab, test_opts)
Shared.test.keyvalue(lab, test_opts)
