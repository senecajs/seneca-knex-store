# Run the tests locally

Goal: run `npm test` against a local Postgres started by Docker.

1. Use Node 24 (Node 22 is also supported).
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
npm install --no-save /path/to/seneca-4.0.0.tgz
npm test
npm install   # restore the devDependency
```

## CI

The GitHub workflow runs the same Postgres image as a service container on
the same port. It is delivered as a patch; see `.patches/README.md` in the
repository root.
