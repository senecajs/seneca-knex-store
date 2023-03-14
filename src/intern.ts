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

  static async findKnex(ent: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)
    const entp = intern.makeentp(ent)

    const isQArray = Array.isArray(q)

    const filter = intern.isObjectEmpty(q) ? {...entp} : isQArray ? q : {...q}

    const args = {
      table_name: ent_table,
      data: intern.isObjectEmpty(filter) ? false : filter,
      isArray: isQArray
    }
    
    const query = await Q.select(args)
    return query.map((row: any) => intern.makeent(ent, row))

  }

  static async firstKnex(ent: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      filter: q
    }

    const query = await Q.first(args)
    // return query
    return intern.makeent(ent, query)
  }

  static async insertKnex(ent: any, data: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)
    const entp = intern.makeentp(ent)

    const args = {
      table_name: ent_table,
      data: {...entp, id: entp.id ? entp.id : Uuid()},
    }

    const query = await Q.insert(args)
    const formattedQuery = query.length == 1 ? query[0] : query

    return intern.makeent(ent, formattedQuery)
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
    const formattedQuery = query.length == 1 ? query[0] : query
    // return query
    return intern.makeent(ent, formattedQuery)
  }

  static async removeKnex(ent: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)
    const entp = intern.makeentp(ent)

    const filter = intern.isObjectEmpty(q) ? {...entp} : {...q}

    const isLoadDeleted = filter.load$ ? true : false

    if (isLoadDeleted) {
      delete filter.load$
    }

    const args = {
      table_name: ent_table,
      filter,
      isLoadDeleted
    }
    
    if (q.all$) {
      await Q.truncate(args)
      //Knex returns the number of rows affected if delete is ok
      return null
    }
    
    const query = await Q.delete(args)
    //Knex returns the number of rows affected if delete is ok
    const result = typeof query == 'number' ? null : 'Error'
    const formattedQuery = query.length == 1 ? query[0] : query
    return isLoadDeleted ? intern.makeent(ent, formattedQuery) : result
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

  static isObjectEmpty(object: any) {  
    return Object.keys(object).length === 0
  }

  static isDate(x: any) {
    return '[object Date]' === toString.call(x)
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

  static async isUpdate(ent: any) {

    if (!ent.id) {
      return false
    }
    
    const id = {
      id: ent.id
    }

    const rowExist = await intern.firstKnex(ent, id)
    const isUpdate = rowExist ? true : false

    return isUpdate
  }

  static async execQuery(query: any, ctx: any) {
    const { client, seneca } = ctx

    if (!query) {
      const err = new Error('An empty query is not a valid query')
      return seneca.fail(err)
    }

    return client.query(query)
  }

  static deepXformKeys(f: any, x: any) : any {
    if (Array.isArray(x)) {
      return x.map((y: any) => intern.deepXformKeys(f, y))
    }

    if (intern.isObject(x)) {
      const out: any = {}

      for (const k in x) {
        out[f(k)] = intern.deepXformKeys(f, x[k])
      }

      return out
    }

    return x
  }

}
