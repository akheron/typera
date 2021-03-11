# Changelog

Release notes for new releases are in
[GitHub releases](https://github.com/akheron/typera/releases).

## 2.0.0

**BREAKING CHANGES**

- Requires TypeScript 4.1 or newer
- Remove dhe deprecated `routeHandler()`, `run()`, `Parser.routeParams()` and
  `Parser.routeParamsP()` functions.
- Remvove the deprecated function chaining syntax for defining routes
- Remove `URL.int()` and `URL.str()` in favor of path patterns and conversions

**New features**

- Type-safe support for path patterns like `'/user/:id(num)/foo/:bar(custom)'`
- Support for registering custom route parameter conversions with
  `route.useParamConversions()`

## 1.0.0

**BREAKING CHANGES**

- Middleware functions now receive a typera request object as an argument.

  Upgrade your typera-koa middleware like this:

  ```typescript
  // OLD
  const myMiddleware: Middleware<...> = (ctx) => {
    doSomething(ctx)
    // ...
  }

  // NEW
  const myMiddleware: Middleware<...> = (req) => {
    doSomething(req.ctx)
    // ...
  }
  ```

  typera-express middleware are not affected, as their argument already was a
  `{ req, res }` object.

- typera-express exported `ExpressContext` was renamed to `RequestBase`.

**Deprecations**

- The previous syntax for defining routes is now deprecated:
  `route(method, path)(middleware)(async request => { ... })`

**New features**

- Export the `RequestBase` type from typera-express and typera-koa
- Add `ChainedMiddleware` to use results from previous middleware
- Add a new syntax for defining routes:
  `route(method, path).use(middleware).handler(async request => { ... })`

**Fixes**

- Middleware: Allow running a finalizer without adding anything to the request
  object by returning `Middleware.next(undefined, f)` (#25)

## 0.7.3

**Dependencies**

- typera-express: Remove peerDependencies, depend directly on express
- typera-koa: Remove peerDependencies, depend directly on koa utility libraries
- Use @koa/router instead of the unmaintained koa-router

## 0.7.2

**Fixes**

- Make the `Middleware` type more lenient about the result type. Using `unknown`
  is preferred if the middleware doesn't add anything to the request.

## 0.7.1

**Fixes**

- Fix URL parsing when there are multiple captures

## 0.7.0

**New features**

- Add `Response.redirect()`
- Add support for streaming responses

**Fixes**

- `typera-express`: Catch promise rejections and forward the errors down the
  middleware chain

## 0.6.0

**New features**

- Add `route.get()`, `.post()`, `.put()`, `.delete()`, `.head()`, `.options()`,
  `.patch()`, `.all()`.
- Add `route.use()`
- Make modules importable from `typera-*/name`, e.g. `typera-koa/response`.

## 0.5.0

**Breaking change**

- Middleware return type changed from `Either` to another type. Use
  `Middleware.next()` to return a result and `Middleware.stop()` to return a
  response from a middleware function.

**New features**

- Add `Middleware.next(value[, finalizer])` and `Middleware.stop(response)`
- Add `applyMiddleware(...middleware)`
- Add 5xx responses to the `Response` namespace

**Other**

- `typera-express`: Change express dependecy to a peerDependency
- `typera-koa`: Change koa and koa-boadyparser dependecies to peerDependencies
- `typera-koa`: Don't depend on koa-router anymore

## 0.4.0

**New features**

- Add support for middleware
- Add `router()` and `route()`

**Deprecations**

- Deprecate `routeHandler()` and `run()` in favor of `router()` and `route()`.

## 0.3.0

**Breaking Change**

- Upgrade `fp-ts` to `^2.0.0`
