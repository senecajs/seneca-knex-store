# @seneca/knex-store

A [Seneca](https://github.com/senecajs/seneca) entity store plugin that keeps
entity data in a SQL database through [Knex](https://knexjs.org), tested
with Postgres. Works with Seneca 4 (tested with 4.0.0-rc5 and 4.0.0) and
Seneca 3, on Node 24 and 22.

[![npm version](https://badge.fury.io/js/%40seneca%2Fknex-store.svg)](https://badge.fury.io/js/%40seneca%2Fknex-store)
[![Build](https://github.com/senecajs/seneca-knex-store/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-knex-store/actions/workflows/build.yml)

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

## Install

```sh
npm install seneca seneca-promisify seneca-entity @seneca/knex-store knex pg
```

Use `seneca-entity@~22.1.0` if you need [transactions](docs/how-to/use-transactions.md).

## Quick Example

```js
const Seneca = require('seneca')

const seneca = Seneca()
  .use('promisify')
  .use('entity', { mem_store: false })
  .use('@seneca/knex-store', {
    client: 'pg',
    connection: {
      host: '127.0.0.1', port: 55433,
      user: 'senecatest', password: 'senecatest_0102',
      database: 'senecatest_knex',
    },
  })

seneca.ready(async function () {
  const foo = await seneca.entity('foo').data$({ p1: 'apple' }).save$()
  console.log(await seneca.entity('foo').load$(foo.id))
  seneca.close()
})
```

The table `foo` must exist. A complete, tested program is in
[docs/examples/getting-started.js](docs/examples/getting-started.js).

## More Examples

* [Getting started](docs/tutorials/getting-started.md)
* [Use transactions](docs/how-to/use-transactions.md)
* [Run the tests locally](docs/how-to/run-the-tests-locally.md)
* [Migrate from Seneca 3](docs/how-to/migrate-from-seneca-3.md)

## Motivation

Knex gives one query builder and connection pool for several SQL databases.
This store lets Seneca entities use it, including Knex transactions, without
writing SQL. See [How it works](docs/explanation/how-it-works.md).

## Support

* Questions and bugs: [GitHub issues](https://github.com/senecajs/seneca-knex-store/issues)
* Seneca documentation: [senecajs/seneca](https://github.com/senecajs/seneca)
* Sponsored by [Voxgig](https://www.voxgig.com)

## API

| Topic | Reference |
| ----- | --------- |
| Plugin options (Knex configuration) | [Options](docs/reference/options.md) |
| Entity actions, query directives | [Messages](docs/reference/messages.md) |
| Transaction actions | [Messages: transactions](docs/reference/messages.md#transactions) |
| Every feature | [Feature index](docs/README.md#feature-index) |

## Contributing

Tests need Postgres. With Docker and Node 24 (or 22):

```sh
npm install
npm run services:up    # postgres:18 on 127.0.0.1:55433
npm test               # builds dist/ with tsc, then runs lab
npm run services:down
```

Settings are read from `SENECA_TEST_PG_*` variables, see
[Run the tests locally](docs/how-to/run-the-tests-locally.md). The
devDependency is the Seneca 4 prerelease (`seneca@^4.0.0-rc5`); `.npmrc`
sets `legacy-peer-deps` while published dependencies exclude it from their
peer range. The CI workflow is in `.patches/` (apply with
`git am .patches/*.patch`).

## Background

The store was created in 2021 (see [CHANGES.md](CHANGES.md)).

| Seneca | Node | Status |
| ------ | ---- | ------ |
| 4.x | 24, 22 | tested |
| 3.x | 18 and later | supported, not tested in CI |

Licensed under [MIT](LICENSE).
