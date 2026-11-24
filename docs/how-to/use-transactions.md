# Use transactions

Goal: run several entity operations inside one Knex transaction.

Transactions need **`seneca-entity` 22.x**, which provides
`seneca.entity.transaction()`, `commit()`, `rollback()`, `adopt()` and
`state()`. Later releases removed that API, and `@seneca/entity` 29, the
entity plugin for Seneca 4, has none; with it the store ignores
transactions and every operation uses the connection pool.

`seneca-entity` 22.x still loads on Seneca 4, and the transaction tests pass
with 22.1.0 in place of `@seneca/entity`. That is not a supported setup for
this release: the peer dependency is `@seneca/entity`, and the transaction
tests run only when `seneca-entity` 22.x is installed by hand (see
[Run the tests locally](run-the-tests-locally.md#transaction-tests)).

1. Enable transactions in `seneca-entity` 22.x, loaded in place of
   `@seneca/entity`:

   ```js
   seneca
     .use('seneca-entity', { mem_store: false, transaction: { active: true } })
     .use('@seneca/knex-store', knexConfig)
   ```

2. Start a transaction. The store calls `knex.transaction()` and returns the
   transaction as the handle:

   ```js
   const s0 = await seneca.entity.transaction()
   await s0.entity('foo').data$({ p1: 't1' }).save$()
   ```

   Operations through `s0` use the transaction. Operations through the
   original instance do not see the uncommitted rows.

3. Commit or roll back:

   ```js
   await s0.entity.commit()     // result: { done: true }
   // or
   await s0.entity.rollback()   // result: { done: false, rollback: true }
   ```

4. To join a transaction you started with Knex yourself, adopt it:

   ```js
   const trx = await Knex(knexConfig).transaction()
   const s1 = await seneca.entity.adopt(trx)
   await s1.entity('foo').data$({ p1: 't2' }).save$()
   await s1.entity.commit()
   ```

5. To run one operation outside the active transaction, add
   `transaction$: false` to the entity message.

If an action fails inside a transaction, its writes stay uncommitted and are
not visible outside the transaction. The tests `rollback-on-error` and
`adopt-rollback-on-error` in `test/knex.test.js` show this.
