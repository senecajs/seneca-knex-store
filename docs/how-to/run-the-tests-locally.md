# Run the tests locally

Goal: run `npm test` against a local Postgres started by Docker.

1. Use Node.js 24 or later.
2. Install dependencies:

   ```sh
   npm install
   ```

3. Start Postgres (`postgres:18`, container `seneca-knex-store-postgres`,
   host port 55433). The command waits until the health check passes:

   ```sh
   npm run services:up
   ```

   The schema in `test/config/docker/dbschema.sql` is loaded on first start.

4. Run the tests. `npm test` builds `dist/` with `tsc` and runs `lab` on the
   compiled code:

   ```sh
   npm test
   ```

5. Stop and remove the container and its volume:

   ```sh
   npm run services:down
   ```

## Connection settings

`npm test` does not start Docker. It reads these variables; the defaults
match `docker-compose.yml`.

| Variable | Default |
| -------- | ------- |
| `SENECA_TEST_PG_HOST` | `127.0.0.1` |
| `SENECA_TEST_PG_PORT` | `55433` |
| `SENECA_TEST_PG_USER` | `senecatest` |
| `SENECA_TEST_PG_PASSWORD` | `senecatest_0102` |
| `SENECA_TEST_PG_DATABASE` | `senecatest_knex` |

## Test against unreleased Seneca

```sh
npm install --no-save /path/to/seneca-4.x.y.tgz
npm test
npm install   # restore the devDependency
```

## Transaction tests

The transaction tests run only when `seneca-entity` 22.x is installed, the
only release with the transaction API the store uses. `@seneca/entity`, the
development dependency, has none, so by default they are reported as
skipped. To run them:

```sh
npm install --no-save seneca-entity@22.1.0
npm test
npm install   # remove it again
```

## CI

The GitHub workflow runs the same Postgres image as a service container on
the same port. It is delivered as a patch; see `.patches/README.md` in the
repository root.
