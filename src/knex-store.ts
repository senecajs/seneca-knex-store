/* Copyright (c) 2010-2022 Richard Rodger and other contributors, MIT License */
import intern from './intern'
import knex from 'knex'

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

  let db : any

  function configure(spec: any, done: any) {

    db = knex(spec)

    return done()

  }

  // Define the store using a description object.
  // This is a convenience provided by seneca.store.init function.
  const store = {
    // The name of the plugin, this is what is the name you would
    // use in seneca.use(), eg seneca.use('knex-store').
    name: STORE_NAME,

    save: async function (this: any, msg: any, reply: any) {
        const { ent, q } = msg
        
        const txDB = await intern.getKnexClient(db, seneca, msg)

        async function do_create() {
          // create a new entity
          try {
            const newEnt = ent.clone$()

            if (ent.id$) {
              newEnt.id = ent.id$
            }

            const doCreate = await intern.insertKnex(txDB, newEnt)

            return doCreate
          } catch (err) {
            return err
          }
        }

        // Save an existing entity
        async function do_save() {
          const doSave = await intern.updateKnex(txDB , ent)
          // call the reply callback with the
          // updated entity
          return doSave
        }


        const save = (await intern.isUpdate(txDB, ent, q)) ? await do_save() : await do_create()
        return reply(null, save)
    },

    load: async function (this: any, msg: any, reply: any) {
      const qent = msg.qent
      const q = msg.q || {}

      const txDB = await intern.getKnexClient(db, seneca, msg)

      const load = await intern.firstKnex(txDB, qent, q)
      reply(null, load)
    },

    list: async function (msg: any, reply: any) {
      const qent = msg.qent
      const q = msg.q || {}

      const txDB = await intern.getKnexClient(db, seneca, msg)
      
      const list = await intern.findKnex(txDB, qent, q)
      reply(null, list)
    },

    remove: async function (this: any, msg: any, reply: any) {
      const qent = msg.qent
      const q = msg.q || {}

      const txDB = await intern.getKnexClient(db, seneca, msg)

      const remove = await intern.removeKnex(txDB, qent, q)
      reply(null, remove)
    },

    native: function (_msg: any, reply: any) {
      reply({ native: ()=> db })
    },

    close: function (_msg: any, reply: any) {
      reply({ native: ()=> db }).then(() => {
        db.destroy()
      })
    },
  }

  // Seneca will call init:plugin-name for us. This makes
  // this action a great place to do any setup.
  const meta = seneca.store.init(seneca, options, store)

  seneca.add(
    { init: store.name, tag: meta.tag },
    function (_msg: any, done: any) {
      return configure(options, done)
    }
  )

  seneca.add('sys:entity,transaction:begin', async function(this: any, msg: any,reply: any) {
      reply({
        get_handle: () => ({name: 'knex' })
      })
  })

  seneca.add('sys:entity,transaction:end', function(msg: any,reply: any) {
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

  seneca.add('sys:entity,transaction:rollback', function(msg: any,reply: any) {
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
    tag: meta.tag,
  }
}

module.exports = knex_store
