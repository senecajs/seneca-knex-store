# Use transactions

Goal: run several entity operations inside one Knex transaction.

Transactions need **seneca-entity 22.x**, which provides
`seneca.entity.transaction()`, `commit()`, `rollback()`, `adopt()` and
`state()`. Later seneca-entity releases removed that API; with them the
store ignores transactions and every operation uses the connection pool.

1. Enable transactions in seneca-entity:

   ```js
   seneca
     .use('promisify')
     .use('entity', { mem_store: false, transaction: { active: true } })
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
