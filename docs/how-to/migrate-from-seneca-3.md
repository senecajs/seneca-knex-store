# Migrate from Seneca 3

Goal: move an application that uses this store from Seneca 3 to Seneca 4.

1. Install Seneca 4 (`seneca@4.0.0-rc5` until 4.0.0 is published) and Node 22
   or later.
2. Keep plugin options in `use()` or in `options.plugin['knex-store']`.
   Seneca 4 does not merge a top level `options['knex-store']` block.
3. Action errors are no longer wrapped. Code that read `err.orig.message`
   or matched `seneca: Action ... failed:` should read `err.message`.
4. Choose the seneca-entity release:
   * 22.1 if you use transactions ([Use transactions](use-transactions.md)),
   * a current release (28 or later) otherwise.
5. Close the instance (`seneca.close()`) to release the Knex pool. On
   Seneca 4 the store listens on `sys:seneca,cmd:close`; on Seneca 3 on
   `role:seneca,cmd:close`.

Nothing changes in the entity API: `make$`, `entity`, `save$`, `load$`,
`list$` and `remove$` behave as before.
