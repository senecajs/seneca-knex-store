# Migrate from Seneca 3

Goal: move an application that uses this store from Seneca 3 to Seneca 4.

1. Use Node.js 24 or later.
2. Install Seneca 4 and the entity plugin `@seneca/entity` in place of
   `seneca-entity`, and drop `seneca-promisify`, which Seneca 4 builds in:

   ```sh
   npm uninstall seneca-entity seneca-promisify
   npm install seneca@^4 @seneca/entity @seneca/knex-store@^8
   ```

   `seneca-entity` 28 and earlier do not load on Seneca 4.0.0 (the error is
   `plugin_gubu_shape`). Load the entity plugin by its full name, before the
   store: `.use('@seneca/entity', { mem_store: false })`.
3. Keep plugin options in `use()` or in `options.plugin['knex-store']`.
   Seneca 4 does not merge a top level `options['knex-store']` block.
4. Action errors are no longer wrapped. Code that read `err.orig.message`
   or matched `seneca: Action ... failed:` should read `err.message`.
5. Transactions: `@seneca/entity` has no transaction API, so every
   operation uses the connection pool. The store's transaction support
   needs `seneca-entity` 22.x, which loads on Seneca 4 but is not a supported
   setup for this release ([Use transactions](use-transactions.md)).
6. Close the instance (`seneca.close()`) to release the Knex pool. The store
   listens on `sys:seneca,cmd:close`.

Nothing changes in the entity API: `make$`, `entity`, `save$`, `load$`,
`list$` and `remove$` behave as before.
