import QBuilder from './qbuilder'
const Uuid = require('uuid').v4
import Assert from 'assert'

const intern = {

  async findKnex(knex: any, ent: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)
    const entp = intern.makeentp(ent)

    const isQArray = Array.isArray(q)

    const filter = intern.isObjectEmpty(q) ? {...entp} : isQArray ? q : {...q}

    if (filter.native$) {
      const argsNative = typeof filter.native$ === 'string' ? {
        query: filter.native$
      } : {
        query: filter.native$[0],
        data: filter.native$.slice(1)
      }
      const query = await QBuilder(knex).raw(argsNative)
      return query.rows.map((row: any) => intern.makeent(ent, row))
    }

    let sort = null
    let skip = null
    let limit = null

    if (filter.sort$) {

      const firstKey = Object.keys(filter.sort$)[0];
      const sortValue = filter.sort$[firstKey] == 1 ? 'ASC' : 'DESC'
      sort = {
        field: firstKey,
        order: sortValue
      }

      delete filter.sort$
    }

    if (filter.skip$) {
      skip = filter.skip$ > 0 ? filter.skip$ : 0
      delete filter.skip$
    }

    if (filter.limit$) {
      limit = filter.limit$ > 0 ? filter.limit$ : null
      delete filter.limit$
    }

    const args = {
      table_name: ent_table,
      data: intern.isObjectEmpty(filter) ? false : filter,
      isArray: isQArray,
      sort,
      skip,
      ...(limit && {limit})
    }
    
    const query = await QBuilder(knex).select(args)
    return query.map((row: any) => intern.makeent(ent, row))

  },

  async firstKnex(knex: any, ent: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    let sort = null
    let skip = null

    if (q.sort$) {

      const firstKey = Object.keys(q.sort$)[0];
      const sortValue = q.sort$[firstKey] == 1 ? 'ASC' : 'DESC'
      sort = {
        field: firstKey,
        order: sortValue
      }

      delete q.sort$
    }

    if (q.skip$) {
      skip = q.skip$ > 0 ? q.skip$ : 0
      delete q.skip$
    }

    if (q.limit$) {
      delete q.limit$
    }

    const args = {
      table_name: ent_table,
      filter: q,
      sort,
      skip
    }

    const query = await QBuilder(knex).first(args)
    return intern.makeent(ent, query)
  },

   async insertKnex(knex: any, ent: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)
    const entp = intern.makeentp(ent)

    // ----------------- TODO - UPSERT -----------------//
    // const { upsert$ } = q ? q : null

    // if (upsert$) {
    //   const args = {
    //     table_name: ent_table,
    //     data: {...entp, id: entp.id ? entp.id : Uuid()},
    //     upsert: upsert$.length == 1 ? upsert$[0] : upsert$
    //   }
      
    //   const query = await QBuilder(knex).insert(args)
    //   const formattedQuery = query.length == 1 ? query[0] : query
  
    //   return intern.makeent(ent, formattedQuery)
    // }

    const args = {
      table_name: ent_table,
      data: {...entp, id: entp.id ? entp.id : Uuid()},
    }

    const query = await QBuilder(knex).insert(args)
    const formattedQuery = query.length == 1 ? query[0] : query
    return intern.makeent(ent, formattedQuery)
  },

   async updateKnex(knex: any, ent: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)
    const entp = intern.makeentp(ent)

    const { id, ...rest } = entp

    const args = {
      table_name: ent_table,
      data: rest,
      id: id
    }

    const query = await QBuilder(knex).update(args)
    const formattedQuery = query.length == 1 ? query[0] : query
    return intern.makeent(ent, formattedQuery)
  },

  //Needs to be refactored to a better way/code
   async removeKnex(knex: any, ent: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)
    const entp = intern.makeentp(ent)

    const filter = intern.isObjectEmpty(q) ? {...entp} : {...q}

    const isLoad = filter.load$ ? true : false

    if (isLoad) {
      delete filter.load$
    }

    let sort = null
    let limit = null
    let skip = null
    let all = null
    let first = null

    if (filter.limit$){
      limit = filter.limit$ > 0 ? filter.limit$ : null
      delete filter.limit$
    }
    
    if (filter.skip$){
      skip = filter.skip$ > 0 ? filter.skip$ : 0
      delete filter.skip$
    }

    if (filter.all$){
      all = filter.all$
      delete filter.all$
    }

    if (filter.sort$ || (all && skip)) {

      if (filter.sort$){
        const firstKey = Object.keys(filter.sort$)[0];
        const sortValue = filter.sort$[firstKey] == 1 ? 'ASC' : 'DESC'
        sort = {
          field: firstKey,
          order: sortValue
        }
      }

      delete filter.sort$
      delete filter.all$

      const argsFind = {
        table_name: ent_table,
        filter,
        sort,
        skip
      }

      if (all) {
        const argsSelect = {
          table_name: ent_table,
          data : filter,
          sort,
          skip,
          limit
        }

        const ids = await QBuilder(knex).select(argsSelect)

        const argsDelete = {
          table_name: ent_table,
          filter: ids.map((id: any) => id.id),
          isLoad,
          skip,
          isArray: true
        }


        await QBuilder(knex).delete(argsDelete)
        return null

      }

      first = await QBuilder(knex).first(argsFind)

    }

    const args = {
      table_name: ent_table,
      filter: first ? {id: first.id} : filter,
      isLoad,
      skip
    }
    
    if (all) {
      await QBuilder(knex).truncate(args)
      //Knex returns the number of rows affected if delete is ok
      return null
    }


    const query = await QBuilder(knex).delete(args)

    //Knex returns the number of rows affected if delete is ok
    const result = typeof query == 'number' ? null : 'Error'
    const formattedQuery = query.length == 1 ? query[0] : query
    return isLoad ? intern.makeent(ent, formattedQuery) : result
  },

   async upsertKnex(knex: any, ent: any, data: any, q: any): Promise<any> {
    const ent_table = intern.tablenameUtil(ent)

    const args = {
      table_name: ent_table,
      data: data,
      id: q
    }

    const query = QBuilder(knex).upsert(args)
    return query
  },

   tablenameUtil(ent: any) {
    const canon = ent.canon$({ object: true })

    return (canon.base ? canon.base + '_' : '') + canon.name
  },

   makeentp(ent: any) {
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
  },

   isObject(x: any) {
    return null != x && '[object Object]' === toString.call(x)
  },

   isObjectEmpty(object: any) {  
    return Object.keys(object).length === 0
  },

   isDate(x: any) {
    return '[object Date]' === toString.call(x)
  },

   getConfig(spec: any) {
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
  },

   makeent(ent: any, row: any) {
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
  },

   async isUpdate(knex: any, ent: any, q: any) {
    // ------------- TODO - UPSERT ----------------//
    // const isUpsert = q.upsert$ ? true : false

    // if (isUpsert) {
    //   delete q.upsert$
    // }

    // if (!ent.id && !isUpsert) {
    //   return false
    // }

    if (!ent.id) {
      return false
    }

    const id = { id: ent.id }

    const rowExist = await intern.firstKnex(knex, ent, id)
    const isUpdate = rowExist ? true : false

    return isUpdate
  }

}

export default intern
