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
        const seneca = this
        const { ent, q } = msg
        
        const knexClient = await intern.getKnexClient(db, seneca, msg, meta)

        async function do_create() {
          // create a new entity
          try {
            const newEnt = ent.clone$()

            if (ent.id$) {
              newEnt.id = ent.id$
            }

            const doCreate = await intern.insertKnex(knexClient, newEnt)

            return doCreate
          } catch (err) {
            return err
          }
        }

        // Save an existing entity
        async function do_save() {
          const doSave = await intern.updateKnex(knexClient , ent)
          // call the reply callback with the
          // updated entity
          return doSave
        }


        const save = (await intern.isUpdate(knexClient, ent, q)) ? await do_save() : await do_create()
        return reply(null, save)
    },

    load: async function (this: any, msg: any, reply: any) {
      const seneca = this
      const qent = msg.qent
      const q = msg.q || {}

      const knexClient = await intern.getKnexClient(db, seneca, msg, meta)

      const load = await intern.firstKnex(knexClient, qent, q)
      reply(null, load)
    },

    list: async function (this: any, msg: any, reply: any) {
      const seneca = this
      const qent = msg.qent
      const q = msg.q || {}

      const knexClient = await intern.getKnexClient(db, seneca, msg, meta)
      
      const list = await intern.findKnex(knexClient, qent, q)
      reply(null, list)
    },

    remove: async function (this: any, msg: any, reply: any) {
      const seneca = this
      const qent = msg.qent
      const q = msg.q || {}

      const knexClient = await intern.getKnexClient(db, seneca, msg, meta)

      const remove = await intern.removeKnex(knexClient, qent, q)
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

  const meta = seneca.store.init(seneca, options, store)

  seneca.add(
    { init: store.name, tag: meta.tag },
    function (_msg: any, done: any) {
      return configure(options, done)
    }
  )

  seneca.add('sys:entity,transaction:begin', async function(this: any, msg: any,reply: any) {
      reply({
        get_handle: () => ({ id: this.util.Nid(), name: 'knex' })
      })
  })

  seneca.add(
    'sys:entity,transaction:end',
    async function (msg: any, reply: any) {
      const transaction = msg.details()
      const client = transaction.client

      try {
        const commit = await client.commit()

        if (commit) {
          reply({
            done: true,
          })
        }
      } catch (err) {
        reply(err)
      }
    }
  )

  seneca.add(
    'sys:entity,transaction:rollback',
    async function (msg: any, reply: any) {
      const transaction = msg.details()
      const client = transaction.client
      try {
        await client.rollback();
          reply({
            done: false,
            rollback: true,
          })
      } catch (err) {
        reply(err)
      }
    }
  )

  seneca.add(
    'sys:entity,transaction:adopt',
    async function (msg: any, reply: any) {
      const trxProvider = db.transactionProvider()
      trxProvider.then((trx: any) => {
        // console.log('trx', trx)
        reply({ get_handle: () => trx })
      })
    }
  )

  // We don't return the store itself, it will self load into Seneca via the
  // init() function. Instead we return a simple object with the stores name
  // and generated meta tag.
  return {
    name: store.name,
    tag: meta.tag,
  }
}

module.exports = knex_store
