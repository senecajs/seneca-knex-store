## 7.2.0 - 2026-10-08

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
