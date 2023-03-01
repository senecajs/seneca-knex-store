/* Copyright (c) 2010-2022 Richard Rodger and other contributors, MIT License */
import { intern } from './intern'
const knex = require('knex')({
  client: 'pg',
  version: '8.8.0'
})

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
  
  const conf = intern.getConfig(options)
  knex.conection = conf

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
      
      const ctx = intern.buildCtx(seneca, msg, meta)

      // check if we are in create mode,
      // if we are do a create, otherwise
      // we will do a save instead

      // Check async if the entity is new or not
      const is_new = await intern.isNew(ent)

      return is_new ? do_create() : do_save()

      // Create a new entity
      function do_create() {
        // generate a new id for the entity
        const id = options.generate_id(ent)

        // create a new entity
        return intern
          .insertKnex(ent, id)
          .then((result: any) => {
            // update the entity with the new id
            ent.id = id

            // call the reply callback with the
            // updated entity
            reply(null, ent)
          })
          .catch((err: Error) => {
            // if there is an error, call the reply
            // callback with the error
            reply(err)
          })
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
  }


  seneca.add(
    { role: store.name, cmd: 'dump' },
    function (_msg: any, reply: any) {
      reply()
    }
  )

  seneca.add(
    { role: store.name, cmd: 'export' },
    function (_msg: any, reply: any) {
      reply()
    }
  )

  // TODO: support direct import of literal objects
  seneca.add(
    { role: store.name, cmd: 'import' },
    function (this: any, msg: any, reply: any) {
      reply()
    }
  )

  // Seneca will call init:plugin-name for us. This makes
  // this action a great place to do any setup.
  const meta = seneca.store.init(seneca, options, store)

  // We don't return the store itself, it will self load into Seneca via the
  // init() function. Instead we return a simple object with the stores name
  // and generated meta tag.
  return {
    name: store.name,
    tag: meta.tag
  }
}

module.exports.preload = function () {
  let seneca = this

  let meta = {
    name: STORE_NAME,
    exportmap: {
      native: function () {
        seneca.export(STORE_NAME + '/native').apply(this, arguments)
      },
    },
  }

  return meta
}

module.exports = knex_store
Object.defineProperty(module.exports, 'name', { value: 'knex-store' })

module.exports.defaults = {
  'entity-id-exists':
    'Entity of type <%=type%> with id = <%=id%> already exists.',
}