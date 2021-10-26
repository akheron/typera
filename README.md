# typera - Type-safe routes

[![Build](https://github.com/akheron/typera/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/akheron/typera/actions/workflows/tests.yml)

Typera helps you build backends in a type-safe manner by leveraging [io-ts] and
some TypeScript type inference magic. It works with both [Express] and [Koa].

**Upgrading to version 2?** See the [upgrading instructions](docs/upgrading.md).

Features of typera in a nutshell:

- A purer approach to building your apps: Each route handler is an async
  function that takes a request and returns a response. Mutable `req` or `res`
  objects? Never again!

- Automatically parses request inputs like route params, query params, headers
  and request body into typed values.

- Infer the types of responses (status code, body, headers), allow type checking
  them according to your expectations.

- Middleware are fully typed. This means that you no longer have to guess what's
  available in `req`, or whether a middleware short-circuits and returns a
  response. Instead, everything is type checked!

- It's straightforward to start adding fully typed routes to an existing Express
  or Koa app. Old routes can be migrated gradually.

- Built-in support for automatically generating an OpenAPI definition from your
  app with [typera-openapi].

Typera is a really thin layer on top of Express or Koa. Most of its code is
TypeScript typings, and the actual runtime stuff is minimal.

See the [documentation](https://akheron.github.io/typera) for tutorial,
examples, API reference and more!

## Development

Run `yarn` to install dependencies.

### Running the test suite

Run `yarn test`.

### Documentation

You need Python 3 to build the docs.

```
python3 -m venv venv
./venv/bin/pip install mkdocs-material
```

Run a live reloading server for the documentation:

```
./venv/bin/mkdocs serve
```

Open http://localhost:8000/ in the browser.

## Releasing

```
$ yarn lerna version <major|minor|patch>
$ yarn lerna publish from-git
```

Open https://github.com/akheron/typera/releases, edit the draft release, select
the newest version tag, adjust the description as needed.

[io-ts]: https://github.com/gcanti/io-ts
[express]: https://expressjs.com/
[koa]: https://koajs.com/
