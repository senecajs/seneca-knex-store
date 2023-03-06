function getConfig() {
  if (process.env.CI) {
    return {
      name: "senecatest_knex_ci",
      host: "localhost",
      port: 5433,
      username: "senecatest",
      password: "senecatest_ci_0102",
      options: {}
    }
  }

  return {
    name: "senecatest_knex",
    host: "localhost",
    port: 5433,
    username: "senecatest",
    password: "senecatest_0102",
    options: {}
  }
}

module.exports = getConfig()
