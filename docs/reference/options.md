# Options

The plugin options object is passed unchanged to `Knex(options)` when the
plugin initialises (`init:knex-store`). The store defines no defaults of its
own, so `client` and `connection` are required.

## Knex configuration

| Option | Type | Default | Effect |
| ------ | ---- | ------- | ------ |
| `client` | string | none | Knex client name. The tests use `pg` (install the `pg` driver). |
| `connection` | object or string | none | Connection settings for the client, for `pg`: `host`, `port`, `user`, `password`, `database`, or a connection URL. |
| any other Knex setting | any | Knex default | For example `pool`, `searchPath`, `debug`. See the Knex documentation. |

Example:

```js
seneca.use('@seneca/knex-store', {
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 55433,
    user: 'senecatest',
    password: 'senecatest_0102',
    database: 'senecatest_knex',
  },
  pool: { min: 0, max: 10 },
})
```

The SQL in `src/` uses `returning('*')`, Postgres arrays in the schema and
`rows` from `knex.raw`, so Postgres is the supported database. Only Postgres
is tested.

## Store options

The options are also given to seneca-entity's store `init`, which reads:

| Option | Type | Default | Effect |
| ------ | ---- | ------- | ------ |
| `map` | object | all canons (`-/-/-`) | Limit the store to some entity canons: keys are canons (`zone/base/name`), values are `'*'` or an array of commands, for example `{ '-/-/foo': '*' }`. |

## Test connection settings

See [Run the tests locally](../how-to/run-the-tests-locally.md#connection-settings).
