const { Q, transactionQuery} = require('./qbuilder')

export class intern {
  static async find_knex(ent: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      id: q
    }

    const query = Q.select(args)
    return query

  }

  static async insert_knex(ent: any, data: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      data: data
    }

    const query = Q.insert(args)
    return query
  }

  static async update_knex(ent: any, data: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      data: data,
      id: q
    }

    const query = Q.update(args)
    return query
  }

  static async remove_knex(ent: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      id: q
    }

    const query = Q.delete(args)
    return query
  }

  static async upsert_knex(ent: any, data: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      data: data,
      id: q
    }

    const query = Q.upsert(args)
    return query
  }

  static async find_knex_transaction(ent: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      id: q
    }

    const query = transactionQuery.select(args)
    return query

  }

  static async insert_knex_transaction(ent: any, data: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      data: data
    }

    const query = transactionQuery.insert(args)
    return query
  }

  static async update_knex_transaction(ent: any, data: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      data: data,
      id: q
    }

    const query = transactionQuery.update(args)
    return query
  }

  static async remove_knex_transaction(ent: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      id: q
    }

    const query = transactionQuery.delete(args)
    return query
  }

  static async upsert_knex_transaction(ent: any, data: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      data: data,
      id: q
    }

    const query = transactionQuery.upsert(args)
    return query
  }

  static tablenameUtil(ent: any) {
    const canon = ent.canon$({ object: true })

    return (canon.base ? canon.base + '_' : '') + canon.name
  }

  static async is_new(ent: any) {
    const isNew = await intern.find_knex(ent, ent.id)

    if (isNew) {
      return true
    }

    return false
  }

  static getConfig(spec: any) {
    let conf

    if ('string' === typeof spec) {
      const urlM = /^postgres:\/\/((.*?):(.*?)@)?(.*?)(:?(\d+))?\/(.*?)$/.exec(spec)

      if (!urlM)
      {
        return null
      }
      conf = {
        name: urlM[7],
        host: urlM[4],
        username: urlM[2],
        password: urlM[3],
        port: urlM[6] ? parseInt(urlM[6], 10) : null,
      }

    } else {
      conf = spec
    }

    // pg conf properties
    conf.user = conf.username
    conf.database = conf.name

    conf.host = conf.host || conf.server
    conf.username = conf.username || conf.user
    conf.password = conf.password || conf.pass

    return conf
  }

}
