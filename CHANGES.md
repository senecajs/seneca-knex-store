# Changes

## 8.0.0 2026-11-20

7.2.0 was prepared but not published (npm has 7.1.0); its changes are part
of this version.

* Seneca 4: the peer dependency is `seneca` `^4.0.0` (was
  `>=3 || >=4.0.0-rc5`). Seneca 3 users stay on `@seneca/knex-store@7`.
* The entity peer dependency is `@seneca/entity` `^29.0.0` (was
  `seneca-entity` `>=22.0`), the entity plugin for Seneca 4. Load it before
  the store, by its full name.
* Node.js 24 or later (`engines.node` `>=24`).
* The store registers through the `entity/init` export and releases the
  Knex pool on `sys:seneca,cmd:close`. The Seneca 3 paths,
  `seneca.store.init` and `role:seneca,cmd:close`, are removed.
* `list$` with an id string or number lists that entity. `@seneca/entity`
  passes such a query unchanged, where `seneca-entity` 22 turned it into
  `{ id }`, and the action timed out.
* Transactions are unchanged and still need `seneca-entity` 22.x. The
  transaction tests pass on Seneca 4 with `seneca-entity` 22.1.0 loaded in
  place of `@seneca/entity`, but that is not a supported setup for this
  release. `@seneca/entity` has no transaction API, so with it every
  operation uses the connection pool (DEC-25).
* Tests use `@seneca/entity` 29 and `@seneca/store-test` 7, loaded by full
  name (B14). Removed the development dependencies `seneca-entity`,
  `seneca-store-test` and `seneca-promisify` (D4), and the `.npmrc` that set
  `legacy-peer-deps`. The transaction tests run only when `seneca-entity`
  22.x is installed by hand.

## 7.2.0 - 2026-10-08 (not published)

* Support the Seneca 4 prerelease (4.0.0-rc5) and Seneca 4.0.0, keeping
  Seneca 3 support. The store init function now comes from the
  `entity/init` export, and the Knex pool is destroyed on
  `sys:seneca,cmd:close` (Seneca 4) or `role:seneca,cmd:close` (Seneca 3).
* Work with seneca-entity releases without the transaction API (23 and
  later); transactions still need seneca-entity 22.x.
* `uuid` is now a declared dependency.
* Tests run on Node 24 and 22 with @hapi/lab 26 against the compiled
  `dist/`, using a `postgres:18` container (`npm run services:up`) on port
  55433; settings come from `SENECA_TEST_PG_*` variables.
* CI workflow delivered as a patch in `.patches/`; Travis removed.
* Documentation reorganised into `docs/` (Diátaxis).

## 1.0.0 - 2021-02-01

* Created Knex-store
