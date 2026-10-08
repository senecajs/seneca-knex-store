# Patches

Files under `.github/workflows/` could not be pushed from the session that
prepared this branch, so the CI change is delivered as a patch. Apply it with:

```sh
git am .patches/*.patch
```

`0001-ci-node-24-22-postgres-service.patch` replaces `build.yml`: Node 24.x
and 22.x on `ubuntu-latest`, a `postgres:18` service container on host port
55433 with a `pg_isready` health check, a step that loads
`test/config/docker/dbschema.sql` with `psql` (service containers start before
checkout, so the schema cannot be mounted), then `npm install`,
`npm run build --if-present` and `npm test`.
