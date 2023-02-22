/* Copyright (c) 2010-2022 Richard Rodger and other contributors, MIT License */
'use strict'

// TODO: use `undefined` as no-error value consistently

import { intern } from './intern'

const knex = require('knex')({
  client: 'pg',
  version: '8.8.0'
})

let internals = {
  name: 'knex-store',
}

module.exports = knex_store
Object.defineProperty(module.exports, 'name', { value: 'knex-store' })

module.exports.defaults = {
  'entity-id-exists':
    'Entity of type <%=type%> with id = <%=id%> already exists.',
}

/* NOTE: `intern` serves as a namespace for utility functions used by
 * the knex store.
 */
module.exports.intern = intern

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
  let seneca: any = this
  
  let conf = intern.getConfig(seneca)
  knex.conection = conf

  let init = seneca.export('entity/init')

  // merge default options with any provided by the caller
  options = seneca.util.deepextend(
    {
      prefix: '/knex-store',
      idlen: 6,
      web: {
        dump: false,
      },

      // TODO: use seneca.export once it allows for null values
      generate_id: seneca.root.private$.exports['entity/generate_id'],
    },
    options
  )

  // The calling Seneca instance will provide
  // a description for us on init(), it will
  // be used in the logs
  let desc: any

  // Our super awesome in knex database. Please bear in mind
  // that this store is meant for fast prototyping, using
  // it for production is not advised!
  let entmap: any = {}

  // Define the store using a description object.
  // This is a convenience provided by seneca.store.init function.
  let store = {
    // The name of the plugin, this is what is the name you would
    // use in seneca.use(), eg seneca.use('knex-store').
    name: internals.name,

    save: async function (this: any, msg: any, reply: any) {
      // Take a reference to Seneca
      // and the entity to save
      let seneca = this
      let ent = msg.ent

      // check if we are in create mode,
      // if we are do a create, otherwise
      // we will do a save instead


      // Check async if the entity is new or not
      const is_new = await intern.is_new(ent)

      return is_new ? do_create() : do_save()

      // Create a new entity
      function do_create() {
        // generate a new id for the entity
        let id = options.generate_id(ent)

        // create a new entity
        return intern
          .insert_knex_transaction(ent, id)
          .then((result: any) => {
            // update the entity with the new id
            ent.id = id

            // save the entity in the entmap
            entmap[ent.id] = ent

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
        intern.insert_knex_transaction(ent, ent.id)

        // call the reply callback with the
        // updated entity
        reply(null, ent)
      }
    },

    load: function (this: any, msg: any, reply: any) {
      let qent = msg.qent
      let q = msg.q || {}

      return intern.find_knex(
        qent,
        q,
      )
        .then((list: any) => {
          reply(null, list[0])
        })
    },

    list: function (msg: any, reply: any) {
      let qent = msg.qent
      let q = msg.q || {}

      return intern.find_knex(
        qent,
        q,
      )
        .then((list: any) => {
          reply(null, list)
        })
    },

    remove: function (this: any, msg: any, reply: any) {
      let qent = msg.qent
      let q = msg.q || {}

      return intern.remove_knex(
        qent,
        q,
      )
        .then((list: any) => {
          reply(null, list)
        }
        )
    },
  }

  // Init the store using the seneca instance, merged
  // options and the store description object above.
  let meta = init(seneca, options, store)
  //let meta = seneca.store.init(seneca, options, store)

  // int() returns some metadata for us, one of these is the
  // description, we'll take a copy of that here.
  desc = meta.desc

  seneca.add(
    { role: store.name, cmd: 'dump' },
    function (_msg: any, reply: any) {
      reply(null, entmap)
    }
  )

  seneca.add(
    { role: store.name, cmd: 'export' },
    function (_msg: any, reply: any) {
      let entjson = JSON.stringify(entmap)

      reply(null, { json: entjson })
    }
  )

  // TODO: support direct import of literal objects
  seneca.add(
    { role: store.name, cmd: 'import' },
    function (this: any, msg: any, reply: any) {
      let imported = JSON.parse(msg.json)
      entmap = msg.merge ? this.util.deepextend(entmap, imported) : imported
      reply()
    }
  )

  // Seneca will call init:plugin-name for us. This makes
  // this action a great place to do any setup.
  seneca.init(function (this: any, reply: any) {
    if (options.web.dump) {
      this.act('role:web', {
        use: {
          prefix: options.prefix,
          pin: { role: 'knex-store', cmd: '*' },
          map: { dump: true },
        },
        default$: {},
      })
    }

    return reply()
  })

  // We don't return the store itself, it will self load into Seneca via the
  // init() function. Instead we return a simple object with the stores name
  // and generated meta tag.
  return {
    name: store.name,
    tag: meta.tag,
    exportmap: {
      native: entmap,
    },
  }
}

module.exports.preload = function () {
  let seneca = this

  let meta = {
    name: internals.name,
    exportmap: {
      native: function () {
        seneca.export(internals.name + '/native').apply(this, arguments)
      },
    },
  }

  return meta
}
