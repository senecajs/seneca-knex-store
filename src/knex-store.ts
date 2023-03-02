/* Copyright (c) 2010-2022 Richard Rodger and other contributors, MIT License */
import { intern } from './intern'
const Pg = require('pg')

const STORE_NAME = 'knex-store'

type Options = {
  prefix: string
  idlen: number
  web: {
    dump: boolean
  }
  generate_id: any
}

function knex_store(this: any, options: Options) {
  // Take a reference to the calling Seneca instance
  const seneca: any = this
  
  let dbPool: {
    end: any ,
    connect: () => Promise<any> 
}

  function configure(spec: any, done: any) {
    const conf = intern.getConfig(spec)

    dbPool = new Pg.Pool({
      user: conf.user,
      host: conf.host,
      database: conf.database,
      password: conf.password,
      port: conf.port
    })

    return done()
  }

  // Define the store using a description object.
  // This is a convenience provided by seneca.store.init function.
  const store = {
    // The name of the plugin, this is what is the name you would
    // use in seneca.use(), eg seneca.use('knex-store').
    name: STORE_NAME,

    save: async function (this: any, msg: any, meta: any, reply: any) {
      // Take a reference to Seneca
      // and the entity to save
      const seneca = this
      const { ent, q } = msg
      console.log(ent)
      console.log(meta)
      
      const ctx = intern.buildCtx(seneca, msg, meta)

      // check if we are in create mode,
      // if we are do a create, otherwise
      // we will do a save instead

      // Check async if the entity is new or not
      const is_new = await intern.isNew(ent)

      return is_new ? do_create() : do_save()

      // Create a new entity
      async function do_create() {
        // generate a new id for the entity
        const id = options.generate_id(ent)

        // create a new entity
        try {
          const result = await intern
            .insertKnex(ent, id)
            console.log(result)
          // update the entity with the new id
          ent.id = id

          // call the reply callback with the
          // updated entity
          reply(null, ent)
        } catch (err) {
          // if there is an error, call the reply
          // callback with the error
          reply(err)
        }
      }

      // Save an existing entity  
      function do_save() {
        intern.updateKnex(ent, ctx, q)
        // call the reply callback with the
        // updated entity
        reply(null, ent)
      }
    },

    load: async function (this: any, msg: any, reply: any) {
      const qent = msg.qent
      const q = msg.q || {}

      const list = await intern.findKnex(
        qent,
        q)
      reply(null, list[0])
    },

    list: async function (msg: any, reply: any) {
      let qent = msg.qent
      let q = msg.q || {}

      const list = await intern.findKnex(
        qent,
        q)
      reply(null, list)
    },

    remove: async function (this: any, msg: any, reply: any) {
      let qent = msg.qent
      let q = msg.q || {}

      const list = await intern.removeKnex(
        qent,
        q)
      reply(null, list)
    },

    native: function (_msg: any, done: any) {
      dbPool.connect().then(done).catch(done)
    },

    close: function (_msg: any, done: any) {
      dbPool.end().then(done).catch(done)
    },
  }

  // Seneca will call init:plugin-name for us. This makes
  // this action a great place to do any setup.
  const meta = seneca.store.init(seneca, options, store)

  seneca.add({ init: store.name, tag: meta.tag }, function (_msg: any, done: any) {
    return configure(options, done)
  })

  // We don't return the store itself, it will self load into Seneca via the
  // init() function. Instead we return a simple object with the stores name
  // and generated meta tag.
  return {
    name: store.name,
    tag: meta.tag
  }
}

module.exports = knex_store