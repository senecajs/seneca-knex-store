import Q from './qbuilder'

export class intern {

  static async findKnex(ent: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      id: q
    }

    const query = Q.select(args)
    return query

  }

  static async firstKnex(ent: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      id: q
    }

    const query = Q.first(args)
    return query
  }

  static async insertKnex(ent: any, data: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      data: data
    }

    const query = Q.insert(args)
    return query
  }

  static async updateKnex(ent: any, ctx: any, q: any): Promise<any> {
    const { client } = ctx
    const escapeIdentifier = client.escapeIdentifier.bind(client)
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      data: escapeIdentifier,
      id: q
    }

    const query = Q.update(args)
    return query
  }

  static async removeKnex(ent: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      id: q
    }

    const query = Q.delete(args)
    return query
  }

  static async upsertKnex(ent: any, data: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      data: data,
      id: q
    }

    const query = Q.upsert(args)
    return query
  }

  static tablenameUtil(ent: any) {
    const canon = ent.canon$({ object: true })

    return (canon.base ? canon.base + '_' : '') + canon.name
  }

  static async isNew(ent: any) {
    const isNew = await intern.findKnex(ent, ent.id)

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

  static buildCtx(seneca: any, msg: any, meta: any) {
    const transaction = seneca.fixedmeta?.custom?.sys__entity?.transaction
    let ctx = null

    if(transaction && false !== msg.transaction$) {
      transaction.trace.push({
        when: Date.now(),
        msg,
        meta,
      })
      
      ctx = {
        transaction,
        client: transaction.client,
      }
    }
    
    return ctx
  }

}
