# How it works

## A thin layer over Knex

The store turns seneca-entity commands into Knex query builder calls
(`src/qbuilder.ts`). It does no schema management: tables must exist, and
column names are the entity field names. Postgres is the target database;
the code relies on `returning('*')` and on `knex.raw` returning `rows`.

## Lifecycle

1. `seneca.use()` runs the plugin definition. It registers the store actions
   through seneca-entity's store `init`, which it takes from the
   `entity/init` export (Seneca 4 with current seneca-entity) or from
   `seneca.store.init` (Seneca 3).
2. `init:knex-store` creates one Knex instance, which owns a connection pool.
3. Entity actions use that instance, or the active transaction handle.
4. On close, the store destroys the pool. Seneca 4 closes through
   `sys:seneca,cmd:close`, Seneca 3 through `role:seneca,cmd:close`; the store
   picks the pattern from `seneca.version`. Without this, the open pool keeps
   the Node process running.

## Values

Plain objects are written as JSON strings. On read, any column whose value
parses as a JSON object becomes an object again. Arrays and Dates are passed
to the driver as they are.

## Seneca 3 and Seneca 4

| | Seneca 3 | Seneca 4 |
| - | -------- | -------- |
| store init function | `seneca.store.init` | `seneca.export('entity/init')` |
| close pattern | `role:seneca,cmd:close` | `sys:seneca,cmd:close` |
| action errors | wrapped, original in `err.orig` | original Error |

## Transactions

Transactions use the seneca-entity 22.x transaction API. The store answers
`sys:entity,transaction:*` with Knex transactions and reads the active one
from `seneca.entity.state()`. Later seneca-entity releases do not have that
API, so with them the store always uses the pool.
