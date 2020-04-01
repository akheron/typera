# Changelog

## 0.7.1

- **Fixes**
  - Fix URL parsing when there are multiple captures

## 0.7.0

- **New features**
  - Add `Response.redirect()`
  - Add support for streaming responses

- **Fixes**
  - `typera-express`: Catch promise rejections and forward the errors
    down the middleware chain

## 0.6.0

- **New features**
  - Add `route.get()`, `.post()`, `.put()`, `.delete()`, `.head()`,
    `.options()`, `.patch()`, `.all()`.
  - Add `route.use()`
  - Make modules importable from `typera-*/name`, e.g.
    `typera-koa/response`.

## 0.5.0

- **Breaking change**
  - Middleware return type changed from `Either` to another type. Use
    `Middleware.next()` to return a result and `Middleware.stop()` to
    return a response from a middleware function.

- **New features**
  - Add `Middleware.next(value[, finalizer])` and `Middleware.stop(response)`
  - Add `applyMiddleware(...middleware)`
  - Add 5xx responses to the `Response` namespace

- **Other**
  - `typera-express`: Change express dependecy to a peerDependency
  - `typera-koa`: Change koa and koa-boadyparser dependecies to peerDependencies
  - `typera-koa`: Don't depend on koa-router anymore

## 0.4.0

- **New features**
  - Add support for middleware
  - Add `router()` and `route()`

- **Deprecations**
  - Deprecate `routeHandler()` and `run()` in favor of `router()` and
    `route()`.

## 0.3.0

- **Breaking Change**
  - Upgrade `fp-ts` to `^2.0.0`
