"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* Copyright (c) 2010-2022 Richard Rodger and other contributors, MIT License */
const intern_1 = require("./intern");
const { asyncMethod } = intern_1.intern;
const knex_1 = __importDefault(require("knex"));
const STORE_NAME = 'knex-store';
function knex_store(options) {
    // Take a reference to the calling Seneca instance
    const seneca = this;
    let db;
    function configure(spec, done) {
        db = (0, knex_1.default)(spec);
        return done();
    }
    // Define the store using a description object.
    // This is a convenience provided by seneca.store.init function.
    const store = {
        // The name of the plugin, this is what is the name you would
        // use in seneca.use(), eg seneca.use('knex-store').
        name: STORE_NAME,
        save: asyncMethod(async function (msg) {
            const { ent, q } = msg;
            // Create a new entity
            async function do_create() {
                // create a new entity
                try {
                    const newEnt = ent.clone$();
                    if (ent.id$) {
                        newEnt.id = ent.id$;
                    }
                    const doCreate = await intern_1.intern.insertKnex(newEnt, db);
                    return doCreate;
                }
                catch (err) {
                    return err;
                }
            }
            // Save an existing entity
            async function do_save() {
                const doSave = await intern_1.intern.updateKnex(ent, db);
                // call the reply callback with the
                // updated entity
                return doSave;
            }
            const save = (await intern_1.intern.isUpdate(ent, db)) ? do_save() : do_create();
            return save;
        }),
        load: async function (msg, reply) {
            const qent = msg.qent;
            const q = msg.q || {};
            const load = await intern_1.intern.firstKnex(qent, q, db);
            reply(null, load);
        },
        list: async function (msg, reply) {
            const qent = msg.qent;
            const q = msg.q || {};
            const list = await intern_1.intern.findKnex(qent, q, db);
            reply(null, list);
        },
        remove: async function (msg, reply) {
            const qent = msg.qent;
            const q = msg.q || {};
            const remove = await intern_1.intern.removeKnex(qent, q, db);
            reply(null, remove);
        },
        native: function (_msg, reply) {
            reply({ native: () => db });
        },
        close: function (_msg, reply) {
            reply({ native: () => db }).then(() => {
                db.destroy();
            });
        },
    };
    // Seneca will call init:plugin-name for us. This makes
    // this action a great place to do any setup.
    const meta = seneca.store.init(seneca, options, store);
    seneca.add({ init: store.name, tag: meta.tag }, function (_msg, done) {
        return configure(options, done);
    });
    // We don't return the store itself, it will self load into Seneca via the
    // init() function. Instead we return a simple object with the stores name
    // and generated meta tag.
    return {
        name: store.name,
        tag: meta.tag,
    };
}
module.exports = knex_store;
//# sourceMappingURL=knex-store.js.map