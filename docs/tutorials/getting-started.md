# Getting started

This tutorial stores entities in Postgres through Knex with Seneca 4.

## 1. Install

```sh
npm install seneca seneca-promisify seneca-entity@~22.1.0 @seneca/knex-store knex pg
```

`seneca-entity` 22.1 is the release whose transaction API this store uses.
Plain save, load, list and remove also work with later seneca-entity releases.

## 2. Start a database

From a clone of this repository:

```sh
npm run services:up
```

This starts `postgres:18` on host port 55433 and creates the test tables from
`test/config/docker/dbschema.sql`. The store does not create tables: each
entity needs an existing table.

## 3. The program

The program is [`docs/examples/getting-started.js`](../examples/getting-started.js):

```js
const Seneca = require('seneca')

const seneca = Seneca({ legacy: false })
  .test()
  .use('promisify')
  .use('entity', { mem_store: false })
  .use(require('../..'), {
    client: 'pg',
    connection: {
      host: process.env.SENECA_TEST_PG_HOST || '127.0.0.1',
      port: parseInt(process.env.SENECA_TEST_PG_PORT || '55433', 10),
      user: 'senecatest',
      password: 'senecatest_0102',
      database: 'senecatest_knex',
    },
  })

seneca.ready(async function () {
  const saved = await seneca
    .entity('foo')
    .data$({ id$: 'example-1', p1: 'apple', x: 1 })
    .save$()
  console.log('saved', saved.id, saved.p1)

  const loaded = await seneca.entity('foo').load$('example-1')
  console.log('loaded', loaded.id, loaded.p1, loaded.x)

  const list = await seneca.entity('foo').list$({ p1: 'apple' })
  console.log('listed', list.length)

  await seneca.entity('foo').remove$('example-1')
  console.log('removed', null == (await seneca.entity('foo').load$('example-1')))

  seneca.close(function () {
    console.log('closed')
  })
})
```

In your own project, replace `require('../..')` with `'@seneca/knex-store'`.

## 4. Run it

```sh
node docs/examples/getting-started.js
```

Output (Seneca 4.0.0-rc5, Node 24):

```
saved example-1 apple
loaded example-1 apple 1
listed 1
removed true
closed
```

## What happened

* The plugin options are a Knex configuration. The store creates one Knex
  instance (a connection pool) when the plugin initialises.
* `save$` inserted a row into table `foo`, because no row with id
  `example-1` existed. A second save with the same id would update it.
* `load$`, `list$` and `remove$` became Knex `select` and `delete` queries.
* `seneca.close` destroyed the connection pool, so the process exited.

## Next steps

* [Use transactions](../how-to/use-transactions.md)
* [Options](../reference/options.md) and [Messages](../reference/messages.md)
* [How it works](../explanation/how-it-works.md)
