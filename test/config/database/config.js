function getConfig() {
  if (process.env.SENECA_KNEX_TEST_CONFIG) {
    return {
      name: "senecatest_knex_ci",
      host: "localhost",
      port: 5433,
      username: "senecatest",
      password: "senecatest_ci_0102",
      options: {}
      // client: 'pg',
      // connection: {
      //   host: '127.0.0.1',
      //   port: 5433,
      //   user: 'senecatest',
      //   password: 'senecatest_0102',
      //   database: 'senecatest_knex',
      // },
    }
  }

  return {
    // name: "senecatest_knex",
    // host: "localhost",
    // port: 5433,
    // username: "senecatest",
    // password: "senecatest_0102",
    // options: {},

    client: 'pg',
    connection: {
      host: '127.0.0.1',
      port: 5433,
      user: 'senecatest',
      password: 'senecatest_0102',
      database: 'senecatest_knex',
    },

    // client: 'sqlite3', // or 'better-sqlite3'
    // connection: {
    //   filename: "./test/config/database/senecatest.db"
    // }
  }
}

module.exports = getConfig()
