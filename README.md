![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) plugin

# @seneca/knex-store

[![npm version](https://img.shields.io/npm/v/seneca-knex-store.svg)](https://npmjs.com/package/seneca-knex-store)
[![build](https://github.com/senecajs/seneca-knex-store/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-knex-store/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/senecajs/seneca-knex-store/badge.svg?branch=master)](https://coveralls.io/github/senecajs/seneca-knex-store?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-knex-store/badge.svg)](https://snyk.io/test/github/senecajs/seneca-knex-store)
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/17225/branches/388415/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=17225&bid=388415)

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

seneca-knex-store is a [Knex](http://knexjs.org) database/ORM plugin for the [Seneca](http://senecajs.org) MVP toolkit.

The Seneca framework provides an [ActiveRecord-style data storage API](http://senecajs.org/docs/tutorials/understanding-data-entities.html).
Each supported database has a plugin, such as this one, that provides
the underlying Seneca plugin actions required for data persistence.

This plugin is loaded by default by the [seneca-entity](https://github.com/senecajs/seneca-entity) plugin that also needs the [seneca-basic](https://github.com/senecajs/seneca-basic) plugin to function properly.

## Install

```sh
npm install seneca
npm install seneca-knex-store
```

You'll need the [seneca](http://github.com/senecajs/seneca) toolkit to use this module - it's just a plugin.

## Quick Example

```js
var seneca = require('seneca')()

seneca.use('basic')
.use('entity')

// Since knex-store is a default plugin, it does not need to be
// added with .use(). You can just go ahead and use it.
seneca.ready(function () {
  var apple = seneca.make$('fruit')
  apple.name = 'Pink Lady'
  apple.price = 0.99

  apple.save$(function (err, apple) {
    console.log("apple.id = " + apple.id)
  })
})
```

## More Examples

For code samples, please see the [tests][knex-store-tests] for this plugin.

### Seneca compatibility
Supports Seneca versions **2.x** and above


### Supported functionality
All Seneca data store supported functionality is implemented in [seneca-store-test](https://github.com/senecajs/seneca-store-test) as a test suite. The tests represent the store functionality specifications.

## Motivation

A [Seneca.js](http://senecajs.org) store plugin using Knex.js for SQL database support.

## Support

If you're using this module and need help, you can:

- Post a [github issue](https://github.com/senecajs/seneca-knex-store/issues)
- Tweet to [@senecajs](http://twitter.com/senecajs)
- Ask on the [Gitter](https://gitter.im/senecajs/seneca)

## API

### Usage

You don't use this module directly. It provides an underlying data storage engine for the Seneca entity API:

```js
var entity = seneca.make$('typename')
entity.someproperty = "something"
entity.anotherproperty = 100

entity.save$(function (err, entity) { ... })
entity.load$({id: ... }, function (err, entity) { ... })
entity.list$({property: ... }, function (err, entity) { ... })
entity.remove$({id: ... }, function (err, entity) { ... })
```

## Contributing

The [Senecajs org](https://github.com/senecajs/) encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

The [Senecajs org][] encourages open participation. If you feel you can help in any way, be it with
documentation, examples, extra testing, or new features please get in touch.

## Background

Part of the [Senecajs org](https://github.com/senecajs/).
