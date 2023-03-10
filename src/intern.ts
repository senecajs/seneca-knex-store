import Q from './qbuilder'
const Uuid = require('uuid').v4
const Assert = require('assert')


export class intern {

  static asyncMethod(f: any) {
    return function(this: any, msg: any, done: any, meta: any) {
      const seneca = this
      const p = f.call(seneca, msg, meta)

      Assert('function' === typeof p.then &&
      'function' === typeof p.catch,
      'The function must be async, i.e. return a promise.')

      return p
        .then((result: any) => done(null, result))
        .catch(done)
    }
  }

  static async findKnex(ent: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table
    }

    const query = await Q.select(args)
    return query

  }

  static async firstKnex(ent: any, id: string): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      id
    }
    const query = await Q.first(args)
    return query
  }

  static async insertKnex(ent: any, data: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)
    const entp = intern.makeentp(ent)

    const args = {
      table_name: ent_table,
      data: {...entp, id: entp.id ? entp.id : Uuid()},
    }

    const query = await Q.insert(args)
    return query
  }

  static async updateKnex(ent: any, data: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)
    const entp = intern.makeentp(ent)

    const { id, ...rest } = entp

    const args = {
      table_name: ent_table,
      data: rest,
      id: id
    }

    const query = await Q.update(args)
    return query
  }

  static async removeKnex(ent: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)
    const entp = intern.makeentp(ent)

    const args = {
      table_name: ent_table,
      id: entp.id
    }

    if (q.all$) {
      const query = Q.truncate(args)
      //Knex returns 1 if delete is ok
      const queryObject = query == 1 ? {delete: true} : {delete: false}
      return queryObject
    }

    const query = await Q.delete(args)
    //Knex returns 1 if delete is ok
    const queryObject = query == 1 ? {delete: true} : {delete: false}
    return queryObject
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

  static makeentp(ent: any) {
    const fields = ent.fields$()
    const entp: any = {}

    for (const field of fields) {
      if (!intern.isDate(ent[field]) && intern.isObject(ent[field])) {
        entp[field] = JSON.stringify(ent[field])
      } else {
        entp[field] = ent[field]
      }
    }

    return entp
  }

  static isObject(x: any) {
    return null != x && '[object Object]' === toString.call(x)
  }

  static isDate(x: any) {
    return '[object Date]' === toString.call(x)
  }

  static async isNew(ent: any) {
    const isNew = await intern.firstKnex(ent, ent.id)
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

  /*
  * NOTE - KEEP - TX SUPPORT WILL COME FOR THE NEXT VERSION
  */
  static buildCtx(seneca: any, msg: any, meta: any) {
    let ctx = {}
    let transaction = seneca.fixedmeta?.custom?.sys__entity?.transaction

    if(transaction && false !== msg.transaction$) {
      transaction.trace.push({
        when: Date.now(),
        msg,
        meta,
      })
      
      ctx = {
        transaction: transaction,
        client: transaction.client,
      }
    }

    return ctx
  }

  static msgForGenerateId(args: any) {
    const { role, target } = args
    return { role, target, hook: 'generate_id' }
  }

  static generateId() {
    const uuidV4 = Uuid()
    return uuidV4
  }

  // KEEP! TX SUPPORT WILL COME FOR THE NEXT VERSION
  static async withDbClient(dbPool: any, ctx: any, f: any) {
    ctx = ctx || {}
    
    let isTransaction = !!ctx.transaction
    
    ctx.client = ctx.client || await dbPool.connect()

    if(isTransaction) {
      if(null == ctx.transaction.client) {
        ctx.transaction.client = ctx.client
        await ctx.client.query('BEGIN')
      }
    }

    let result

    try {
      result = await f(ctx.client)
    }
    catch(e) {
      if(isTransaction) {
	await ctx.client.query('ROLLBACK')
      }
      throw e
    }
    finally {
      if(!isTransaction) {
	ctx.client.release()
      }
    }

    return result
  }

  static makeent(ent: any, row: any) {
    if (!row) {
      return null
    }

    const fields = Object.keys(row)
    const entp: any = {}

    for (const field of fields) {
      let value = row[field]

      try {
        const parsed = JSON.parse(row[field])

        if (intern.isObject(parsed)) {
          value = parsed
        }
      } catch (err) {
        if (!(err instanceof SyntaxError)) {
          throw err
        }
      }

      entp[field] = value
    }

    return ent.make$(entp)
  }

  static isUpdate(msg: any) {
    const { ent } = msg
    return !!ent.id
  }

  static async execQuery(query: any, ctx: any) {
    const { client, seneca } = ctx

    if (!query) {
      const err = new Error('An empty query is not a valid query')
      return seneca.fail(err)
    }

    return client.query(query)
  }

  static identity(x: any) {
    return x
  }

}
