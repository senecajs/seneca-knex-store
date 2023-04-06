/* Copyright (c) 2010-2022 Richard Rodger and other contributors, MIT License */
import Intern from './intern'
import Knex from 'knex'

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

  let rootKnexClient: any

  function configure(spec: any, done: any) {

    rootKnexClient = Knex(spec)

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

      const knexClient = await Intern.getKnexClient(rootKnexClient, seneca, msg, meta)

      async function do_create() {
        // create a new entity
        try {
          const newEnt = ent.clone$()

          if (ent.id$) {
            newEnt.id = ent.id$
          }

          const doCreate = await Intern.insertKnex(knexClient, newEnt)

          return doCreate
        } catch (err) {
          return err
        }
      }

      // Save an existing entity
      async function do_save() {
        const doSave = await Intern.updateKnex(knexClient, ent)
        // call the reply callback with the
        // updated entity
        return doSave
      }


      const save = (await Intern.isUpdate(knexClient, ent, q)) ? await do_save() : await do_create()
      return reply(null, save)
    },

    load: async function (this: any, msg: any, reply: any) {
      const seneca = this
      const qent = msg.qent
      const q = msg.q || {}

      const knexClient = await Intern.getKnexClient(rootKnexClient, seneca, msg, meta)

      const load = await Intern.firstKnex(knexClient, qent, q)
      reply(null, load)
    },

    list: async function (this: any, msg: any, reply: any) {
      const seneca = this
      const qent = msg.qent
      const q = msg.q || {}

      const knexClient = await Intern.getKnexClient(rootKnexClient, seneca, msg, meta)

      const list = await Intern.findKnex(knexClient, qent, q)
      reply(null, list)
    },

    remove: async function (this: any, msg: any, reply: any) {
      const seneca = this
      const qent = msg.qent
      const q = msg.q || {}

      const knexClient = await Intern.getKnexClient(rootKnexClient, seneca, msg, meta)

      const remove = await Intern.removeKnex(knexClient, qent, q)
      reply(null, remove)
    },

    native: function (_msg: any, reply: any) {
      reply({ native: () => rootKnexClient })
    },

    close: function (_msg: any, reply: any) {
      reply({ native: () => rootKnexClient }).then(() => {
        rootKnexClient.destroy()
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

  seneca.add('sys:entity,transaction:transaction', async function (this: any, msg: any, reply: any) {
    const trxKnexClient = await rootKnexClient.transaction()

    reply({
      get_handle: () => trxKnexClient
    })
  })


  seneca.add(
    'sys:entity,transaction:commit',
    function (msg: any, reply: any) {
      const transactionDetails = msg.get_transaction()
      const trxKnexClient = transactionDetails.handle

      trxKnexClient
        .commit()
        .then(() => {
          reply({
            done: true,
          })
        })
        .catch(reply)
    })


  seneca.add(
    'sys:entity,transaction:rollback',
    function (msg: any, reply: any) {
      const transactionDetails = msg.get_transaction()
      const trxKnexClient = transactionDetails.handle

      trxKnexClient
        .rollback()
        .then(() => {
          reply({
            done: false,
            rollback: true,
          })
        })
        .catch((err: any) => {
          console.log('WWW', err)
          reply(err)
        })
    }
  )


  seneca.add(
    'sys:entity,transaction:adopt',
    function (msg: any, reply: any) {
      const trxKnexClient = msg.get_handle()
      // Since transaction already exists, no need to do anything, just return it
      reply({ get_handle: () => trxKnexClient })
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
