import qBuilder from './qbuilder'
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

  static async findKnex(ent: any, q: any, knex: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)
    const entp = intern.makeentp(ent)

    const isQArray = Array.isArray(q)

    const filter = intern.isObjectEmpty(q) ? {...entp} : isQArray ? q : {...q}

    const args = {
      table_name: ent_table,
      data: intern.isObjectEmpty(filter) ? false : filter,
      isArray: isQArray
    }
    
    const query = await qBuilder(knex).select(args)
    return query.map((row: any) => intern.makeent(ent, row))

  }

  static async firstKnex(ent: any, q: any, knex: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      filter: q
    }

    const query = await qBuilder(knex).first(args)
    // return query
    return intern.makeent(ent, query)
  }

  static async insertKnex(ent: any, knex: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)
    const entp = intern.makeentp(ent)

    const args = {
      table_name: ent_table,
      data: {...entp, id: entp.id ? entp.id : Uuid()},
    }

    const query = await qBuilder(knex).insert(args)
    const formattedQuery = query.length == 1 ? query[0] : query

    return intern.makeent(ent, formattedQuery)
  }

  static async updateKnex(ent: any, knex: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)
    const entp = intern.makeentp(ent)

    const { id, ...rest } = entp

    const args = {
      table_name: ent_table,
      data: rest,
      id: id
    }

    const query = await qBuilder(knex).update(args)
    const formattedQuery = query.length == 1 ? query[0] : query
    // return query
    return intern.makeent(ent, formattedQuery)
  }

  static async removeKnex(ent: any, q: any, knex: any): Promise<any> {
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
      await qBuilder(knex).truncate(args)
      //Knex returns the number of rows affected if delete is ok
      return null
    }
    
    const query = await qBuilder(knex).delete(args)
    //Knex returns the number of rows affected if delete is ok
    const result = typeof query == 'number' ? null : 'Error'
    const formattedQuery = query.length == 1 ? query[0] : query
    return isLoadDeleted ? intern.makeent(ent, formattedQuery) : result
  }

  static async upsertKnex(ent: any, data: any, q: any, knex: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      data: data,
      id: q
    }

    const query = qBuilder(knex).upsert(args)
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

  static msgForGenerateId(args: any) {
    const { role, target } = args
    return { role, target, hook: 'generate_id' }
  }

  static generateId() {
    const uuidV4 = Uuid()
    return uuidV4
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

  static async isUpdate(ent: any, knex: any) {

    if (!ent.id) {
      return false
    }
    
    const id = {
      id: ent.id
    }

    const rowExist = await intern.firstKnex(ent, id, knex)
    const isUpdate = rowExist ? true : false

    return isUpdate
  }

}
