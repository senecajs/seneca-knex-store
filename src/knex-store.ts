/* Copyright (c) 2010-2022 Richard Rodger and other contributors, MIT License */
import { intern } from './intern'
const Pg = require('pg')
const { asyncMethod } = intern

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
  const seneca = this
  
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

    save: asyncMethod(async function (this: any, msg: any, meta: any){
      const seneca = this

      const ctx = intern.buildCtx(seneca, msg, meta)
      
      return intern.withDbClient(dbPool, ctx, async (client: any) => {
          const ctx = { seneca, client }
          const { ent, q } = msg
          const { auto_increment$: autoIncrement = false } = q


          // check if we are in create mode,
          // if we are do a create, otherwise
          // we will do a save instead
          // Check async if the entity is new or not
          const is_new = await intern.isNew(ent)
          console.log('is_new',is_new)

          // return is_new ? do_create() : do_save()
        return do_create()
          // Create a new entity
          async function do_create() {
            // generate a new id for the entity
            // const id = intern.generateId()

            // create a new entity
            try {
            const newEnt = ent.clone$()
            console.log('newEnt', newEnt)

            const insertTest = intern.insertKnex(newEnt, ctx)
            console.log(insertTest)

            return insertTest

            } catch (err) {
              console.log(err)
              return err
            }
          }

          // Save an existing entity  
          function do_save() {
            const doSave = intern.updateKnex(ent, ctx)
            // call the reply callback with the
            // updated entity
            console.log(doSave)
            return doSave
          }
        })
    }),

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

  seneca.add(intern.msgForGenerateId({ role: 'sql', target: STORE_NAME }),
  function (_msg: any, done: any) {
    const id = intern.generateId()
    return done(null, { id })
  })


seneca.add('sys:entity,transaction:begin', (msg: any, reply: any) => {
  // NOTE: `BEGIN` is called in intern.withDbClient
  reply({
    handle: { id: this.util.Nid(), name: 'postgres' }
  })
})

seneca.add('sys:entity,transaction:end', function(msg: any, reply: any) {
  let transaction = msg.details()
  let client = transaction.client
  client.query('COMMIT')
    .then(()=>{
      reply({
        done: true
      })
    })
    .catch((err: any)=>reply(err))
})

seneca.add('sys:entity,transaction:rollback', function(msg: any, reply: any) {
  let transaction = msg.details()
  let client = transaction.client

  client.query('ROLLBACK')
    .then(()=>{
      reply({
        done: false, rollback: true
      })
    })
    .catch((err: any)=>reply(err))
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