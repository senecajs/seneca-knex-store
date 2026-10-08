# Messages

The store registers the standard seneca-entity store actions through
seneca-entity's store `init`, plus transaction and lifecycle actions. You
normally call them through the entity API (`save$`, `load$`, `list$`,
`remove$`, `native$`). Seneca 3 style `role:entity,cmd:*` messages are
translated to `sys:entity` by seneca-entity.

Each entity maps to a table named `<base>_<name>` (or `<name>` when there is
no base). Zone is ignored. The table must exist.

## save

`sys:entity,cmd:save`, parameters `ent` (the entity) and `q`.

* If `ent.id` is set and a row with that id exists, the row is updated
  (`update ... returning *`).
* Otherwise a row is inserted. The id is `ent.id$`, else `ent.id`, else a
  random UUID v4.
* Object values (not Dates) are stored as JSON strings.
* Reply: the saved entity built from the returned row.

## load

`sys:entity,cmd:load`, parameter `q`: a filter object (`{ id: 'a' }`,
`{ p1: 'x' }`). `sort$` and `skip$` apply; `limit$` is ignored. Reply: the
first matching entity, or `null`.

## list

`sys:entity,cmd:list`, parameter `q`: a filter object, an array of ids, or
`{ native$: ... }`. With an empty `q` the entity's own fields are the filter.
Reply: an array of entities.

## remove

`sys:entity,cmd:remove`, parameter `q`:

| Query | Effect |
| ----- | ------ |
| filter | Deletes the first matching row. |
| filter with `load$: true` | Deletes it and replies with the removed entity. |
| filter with `all$: true` | Deletes every matching row (`sort$`, `skip$`, `limit$` apply). |
| `{ all$: true }` only | Truncates the table. |

Reply: `null`, or the removed entity with `load$`.

## native

`sys:entity,cmd:native`. Reply: `{ native: () => knex }`, the root Knex
instance.

## close

`sys:entity,cmd:close`. Destroys the Knex pool.

## Query directives

| Directive | Applies to | Effect |
| --------- | ---------- | ------ |
| `sort$: { field: 1 }` | load, list, remove | Order by the first key, `1` ascending, anything else descending. |
| `skip$: n` | load, list, remove | `offset(n)` when `n > 0`. |
| `limit$: n` | list, remove | `limit(n)` when `n > 0`. |
| `native$: 'sql'` or `['sql', ...bindings]` | list | Runs `knex.raw` and maps `rows` to entities. |

## Transactions

Available only with seneca-entity 22.x (see
[Use transactions](../how-to/use-transactions.md)).

| Pattern | Reply |
| ------- | ----- |
| `sys:entity,transaction:transaction` | `{ get_handle }` returning a new `knex.transaction()`. |
| `sys:entity,transaction:commit` | `{ done: true }` after `trx.commit()`. |
| `sys:entity,transaction:rollback` | `{ done: false, rollback: true }` after `trx.rollback()`. |
| `sys:entity,transaction:adopt` | `{ get_handle }` returning the Knex transaction given by `msg.get_handle()`. |

While a transaction is active and not finished, entity actions use its
handle unless the message has `transaction$: false`.

## Init and close hooks

| Pattern | Effect |
| ------- | ------ |
| `init:knex-store` | Creates the Knex instance from the plugin options. |
| `sys:seneca,cmd:close` (Seneca 4) or `role:seneca,cmd:close` (Seneca 3) | Destroys the Knex pool, then calls the prior close action. |

## Plugin exports

The plugin definition returns `{ name: 'knex-store', tag }`. It defines no
`exports`; use `native$` to reach Knex.

## Errors

The store defines no error codes.
