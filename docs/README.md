# seneca-knex-store documentation

The documentation follows the [Diátaxis](https://diataxis.fr) layout:
tutorials to learn, how-to guides for tasks, reference for facts, and
explanation for background.

## Tutorials

| Page | What you learn |
| ---- | -------------- |
| [Getting started](tutorials/getting-started.md) | Install the store, connect to Postgres and run save, load, list and remove. |

## How-to guides

| Page | Task |
| ---- | ---- |
| [Run the tests locally](how-to/run-the-tests-locally.md) | Start Postgres with Docker and run `npm test`. |
| [Use transactions](how-to/use-transactions.md) | Group entity operations in a Knex transaction. |
| [Migrate from Seneca 3](how-to/migrate-from-seneca-3.md) | Move an application using this store to Seneca 4. |

## Reference

| Page | Contents |
| ---- | -------- |
| [Options](reference/options.md) | Plugin options and connection settings. |
| [Messages](reference/messages.md) | Action patterns, query directives and replies. |

## Explanation

| Page | Topic |
| ---- | ----- |
| [How it works](explanation/how-it-works.md) | Table naming, value mapping, lifecycle and Seneca 3 versus 4. |

## Feature index

| Feature | Kind | Documented in |
| ------- | ---- | ------------- |
| `client` | option | [Options](reference/options.md#knex-configuration) |
| `connection` | option | [Options](reference/options.md#knex-configuration) |
| other Knex settings (`pool`, `searchPath`, ...) | option | [Options](reference/options.md#knex-configuration) |
| `map` | option (seneca-entity) | [Options](reference/options.md#store-options) |
| `SENECA_TEST_PG_*` | test environment variables | [Run the tests locally](how-to/run-the-tests-locally.md) |
| `sys:entity,cmd:save` | action | [Messages](reference/messages.md#save) |
| `sys:entity,cmd:load` | action | [Messages](reference/messages.md#load) |
| `sys:entity,cmd:list` | action | [Messages](reference/messages.md#list) |
| `sys:entity,cmd:remove` | action | [Messages](reference/messages.md#remove) |
| `sys:entity,cmd:native` | action | [Messages](reference/messages.md#native) |
| `sys:entity,cmd:close` | action | [Messages](reference/messages.md#close) |
| `init:knex-store` | action | [Messages](reference/messages.md#init-and-close-hooks) |
| `sys:seneca,cmd:close` / `role:seneca,cmd:close` | action (close hook) | [Messages](reference/messages.md#init-and-close-hooks) |
| `sys:entity,transaction:transaction` | action | [Messages](reference/messages.md#transactions) |
| `sys:entity,transaction:commit` | action | [Messages](reference/messages.md#transactions) |
| `sys:entity,transaction:rollback` | action | [Messages](reference/messages.md#transactions) |
| `sys:entity,transaction:adopt` | action | [Messages](reference/messages.md#transactions) |
| `sort$`, `skip$`, `limit$` | query directive | [Messages](reference/messages.md#query-directives) |
| `native$` | query directive | [Messages](reference/messages.md#query-directives) |
| `all$`, `load$` | query directive (remove) | [Messages](reference/messages.md#remove) |
| `transaction$` | message directive | [Messages](reference/messages.md#transactions) |
| plugin return value `{ name, tag }` | export | [Messages](reference/messages.md#plugin-exports) |
| error codes | none defined | [Messages](reference/messages.md#errors) |
| CLI | none | not applicable |
