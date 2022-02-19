# API Reference

## Imports

typera exposes its contents in various modules, e.g. `Response`, `Middleware`,
`Parser`, etc. In the examples below, they are imported from the top-level
module like this:

```typescript
import { Response, Middleware, Parser } from 'typera-express'
// or
import { Response, Middleware, Parser } from 'typera-koa'
```

You can also import from the individual modules:

```typescript
import * as Response from 'typera-express/response'
import * as Middleware from 'typera-express/middleware'
import * as Parser from 'typera-express/parser'
// or
import * as Response from 'typera-koa/response'
import * as Middleware from 'typera-koa/middleware'
import * as Parser from 'typera-koa/parser'
```

And of course, you can also import individual items when importing directly from
the modules:

```typescript
import { BadRequest } from 'typera-koa/express'
// or
import { BadRequest } from 'typera-koa/response'
```

## Responses

All response related types and functions live in the `Response` namespace.

```typescript
import { Response } from 'typera-express'
// or
import { Response } from 'typera-koa'
```

The generic `Response` type looks like this:

```typescript
type OptionalHeaders = { [key: string]: string } | undefined

type Response<Status, Body, Headers extends OptionalHeaders> = {
  status: Status
  body: Body
  headers: Headers
}
```

There is a separate type and a function to construct a response of that type for
each valid HTTP status code.

For example, the response type for a 200 OK is:

```typescript
type Ok<
  Body = undefined,
  Headers extends OptionalHeaders = undefined
> = Response<200, Body, Headers>
```

The function to construct a 200 OK response has the following overloaded
signatures:

```typescript
function ok(): Ok
function ok<Body>(body: Body): Ok<Body>
function ok<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): Ok<Body, Headers>
```

All response types have the `Body` and `Headers` type parameters. With other
than [redirect responses](#redirects), both default to `undefined`. All response
constructor functions have the same 3 signatures.

### Common responses

Here's a list of most common responses:

| HTTP                   | Type               | Constructor function |
| ---------------------- | ------------------ | -------------------- |
| 200 OK                 | `Ok`               | `ok`                 |
| 201 Created            | `Created`          | `created`            |
| 204 No Content         | `NoContent`        | `noContent`          |
| 301 Moved Permanently  | `MovedPermanently` | `movedPermanently`   |
| 302 Found              | `Found`            | `found`              |
| 304 Not Modified       | `NotModified`      | `notModified`        |
| 400 Bad Request        | `BadRequest`       | `badRequest`         |
| 401 Unauthorized       | `Unauthorized`     | `unauthorized`       |
| 403 Forbidden          | `Forbidden`        | `forbidden`          |
| 404 Not Found          | `NotFound`         | `notFound`           |
| 405 Method Not Allowed | `MethodNotAllowed` | `methodNotAllowed`   |

For the full list of supported responses, see
[response.ts](https://github.com/akheron/typera/tree/main/packages/typera-common/src/response.ts).

### Redirects

Redirecting the client to another URL is a common thing to do and requires
setting a header. To create a redirect response, use the
`redirect(status, location)` helper:

```typescript
const myHandler: Route<Response.MovedPermanently> = route
  .get('/foo')
  .handler(async (request) => {
    return Response.redirect(301, '/bar')
  })
```

This generates a response with a string body and the `Location` header set:

```
HTTP/1.1 301 Moved Permanently
Location: /bar

Moved premanently. Redirecting to /bar
```

For simplicity, the redirecting responses listed below have the default body
type of `string` and the default headers type of `{ location: string }`:

| HTTP                   | Type                | Constructor function      |
| ---------------------- | ------------------- | ------------------------- |
| 301 Moved Permanently  | `MovedPermanently`  | `redirect(301, location)` |
| 302 Found              | `Found`             | `redirect(302, location)` |
| 303 See Other          | `SeeOther`          | `redirect(303, location)` |
| 307 Temporary Redirect | `TemporaryRedirect` | `redirect(307, location)` |
| 308 Permanent Redirect | `PermanentRedirect` | `redirect(308, location)` |

Use the "normal" constructor functions (`movedPermanently()`, `found()`, ...) if
you want full control over the body and headers.

#### `redirect`

Signature: `Response.redirect(status, location)`

Creates a response that redirects to the given location. The response body will
be a textual explanation of the redirect.

### Streaming responses

Use the `Response.StreamingBody` body type and the `Response.streamingBody()`
function to create streaming responses. The function takes a callback that
receives a writable stream as a parameter:

```typescript
const streamingHandler: Route<Response.Ok<Response.StreamingBody>> = route
  .get('/document.pdf')
  .handler(async (request) => {
    return Response.ok(
      Response.streamingBody((outputStream) => {
        // Assuming that the generatePDF function generates a
        // PDF document to the given writable stream
        generatePDF(outputStream)
      })
    )
  })
```

## Middleware

```typescript
import * as Either from 'fp-ts/lib/Either'
import { RequestBase, Middleware, ChainedMiddleware } from 'typera-koa'
// or
import { RequestBase, Middleware, ChainedMiddleware } from 'typera-express'
```

Middleware are asynchronous functions that take a typera request object as a
parameter, and produce either a `Response` or an object.

If a middleware function produces a `Response`, then the request handling is
stopped and that response is sent to the client. If it produces an object, that
object is merged to the typera request object which is passed forward to the
next middleware and eventually to the route handler.

A middleware function can also add a finalizer function to be called after the
request handler has finished. This is useful if the middleware allocates some
resources that need to be released afterwards (e.g. release a database
connection, delete a temporary file, etc.)

For example, here's a middleware that authenticates a user and adds user info to
the typera request object:

```typescript
const authenticateUser: Middleware.Middleware<
  // This is the object that's merged to request on success
  { user: User },
  // This is the response that is be returned by the middleware on failure
  Response.Unauthorized<string>
> = async () => {
  const user = await authenticateUser() // Gets a user somehow and returns null if unauthenticated
  if (!user) {
    return Middleware.stop(Response.unauthorized('Login first'))
  }
  return Middleware.next({ user })
}
```

Another example of a middleware that adds a database client to the typera
request object. It never returns a response, so the response type is `never`.

```typescript
import * as pg from 'pg'

const pool = new pg.Pool()

const db: Middleware.Middleware<{ connection: pg.ClientBase }, never> =
  async () => {
    const connection = await pool.connect()
    return Middleware.next({ connection }, () => connection.release())
  }
```

If you write a middleware that adds nothing to the typera request object, its
result type should be `unknown`:

```typescript
const checkOrigin: Middleware.Middleware<
  unknown,
  Response.BadRequest<string>
> = async (request) => {
  // In typera-express, request.req is the Express request
  if (request.req.get('origin') !== 'example.com') {
    return Middleware.stop(Response.badRequest('Invalid origin'))
  }
  return Middleware.next()
}
```

### `next`

Signatures:

- `Middleware.next()`
- `Middleware.next(value)`
- `Middleware.next(value, finalizer)`

Construct a value to be merged with the typera request object, and optionally
add a finalizer to be run when the request processing has finished.

If `Middleware.next()` is called with no arguments, nothing is added to the
typera request object.

The finalizer, if given, is called with no arguments. It can be an async
function (can return a `Promise`).

If you want to run a finalizer but not add anything to the request, you can pass
`{}` or `undefined` as the value.

### `stop`

Signature: `Middleware.stop(response)`

Stop processing the request and return `response` to the client. Other
middleware or the route handler will not be run. If other middleware have
already run before this one, their finalizers are run.

### `ChainedMiddleware`

If you need to use the result of some previous middleware, use
`ChainedMiddleware`. It's like `Middleware` but takes as first type parameter
the type that previous middleware should produce. This middleware writes audit
entries to database, so it requires a database connection from the `db`
middleware above:

```typescript
const audit: Middleware.ChainedMiddleware<
  { connection: pg.ClientBase },
  unknown,
  never
> = async (request) => {
  await writeAuditLog(request.connection)
  return Middleware.next()
}
```

Now, the `audit` middleware can only be used if the `db` middleware comes before
it and adds `connection` to the request object.

```typescript
const myRoute = route.use(db).use(audit)
```

## Request parsers

Request parsers are built-in middleware that let you validate parts of the
request. All request parser related types and functions live in the `Parser`
namespace.

```typescript
import * as t from 'io-ts'
import { Parser } from 'typera-express'
// or
import { Parser } from 'typera-koa'
```

typera provides functions to build request parser middleware for query string
and request body. These functions take an [io-ts] codec (`t.Type`) and return a
middleware that validates the corresponding part of the request using the given
codec. If the validation fails, they produce an error response with appropriate
status code and error message in the body.

### `query`

Signature: `Parser.query(codec)`

Validate the query string according to the given [io-ts] codec. Respond with
`400 Bad Request` if the validation fails. The result will be available as
`request.query` in the route handler.

The input for this parser will be the query string parsed as
`Record<string, string>`, i.e. all parameter values will be strings. If you want
to convert them to other types, you probably find the `FromString` codecs from
[io-ts-types] useful (e.g. `IntFromString`, `BooleanFromString`, etc.)

### `body`

Signature: `Parser.body(codec)`

Validate the request body according to the given [io-ts] codec. Respond with
`400 Bad Request` if the validation fails. Ther result will be available as
`request.body` in the route handler.

The input for this parser will be the request body, parsed with the body parser
of your choice. With [Express] you probably want to use [body-parser], and with
[Koa] the most common choice is [koa-bodyparser]. Note that these are native
[Express] or [Koa] middleware, so you must attach them directly to the [Express]
or [Koa] app rather than use them as typera middleware.

!!! note

    You must use a Express or Koa body parsing middleware for
    `Parser.body` to work.

### `headers`

Signature: `Parser.headers(codec)`

Validate the request headers according to the given non-exact [io-ts] codec.
Respond with `400 Bad Request` if the validation fails. The result will be
available as `request.headers` in the route handler.

Header matching is case-insensitive, so using e.g. `X-API-KEY`, `x-api-key` and
`X-Api-Key` in the codec will all read the same header. However, the parse
_result_ will of course be case sensitive. That is, the field in
`request.headers` will have the name you specify in the [io-ts] codec you pass
to `Parser.headers`, with case preserved.

The input for this parser will be the headers parsed as
`Record<string, string>`, i.e. all header values will be strings. If you want to
convert them to other types, you probably find the `FromString` codecs from
[io-ts-types] useful (e.g. `IntFromString`, `BooleanFromString`, etc.)

Exact codecs (eg. io-ts functions `strict` & `exact`) are not supported as their
property stripping behavior is not compatible with typera's case-preserving
logic. Regardless, the parsing behavior is logically similar to using exact
codecs as `request.headers` will not contain unparsed headers.

### `cookies`

Signature: `Parser.cookies(codec)`

Validate the request cookies according to the given [io-ts] codec. Respond with
`400 Bad Request` if the validation fails. The result will be available as
`request.cookies` in the route handler.

The input for this parser will be the cookies parsed as
`Record<string, string>`, i.e. all cookie values will be strings. If you want to
convert them to other types, you probably find the `FromString` codecs from
[io-ts-types] useful (e.g. `IntFromString`, `BooleanFromString`, etc.)

### Customizing the error response

Each of the above functions also have a `P` flavor that allows the user to
override error handling. In addition to an [io-ts] codec, these functions take
an error handler function that receives an [io-ts] validation error and produces
an error response:

```typescript
type ErrorHandler<ErrorResponse extends Response.Response<number, any, any>> = (
  errors: t.Errors
) => ErrorResponse

function queryP<
  Codec extends t.Type<any>,
  ErrorResponse extends Response.Response<number, any, any>
>(
  codec: Codec,
  errorHandler: ErrorHandler<ErrorResponse>
): Middleware<{ query: t.TypeOf<Codec> }, ErrorResponse>

function bodyP<
  Codec extends t.Type<any>,
  ErrorResponse extends Response.Response<number, any, any>
>(
  codec: Codec,
  errorHandler: ErrorHandler<ErrorResponse>
): Middleware<{ body: t.TypeOf<Codec> }, ErrorResponse>

function headersP<
  Codec extends t.Type<any>,
  ErrorResponse extends Response.Response<number, any, any>
>(
  codec: Codec,
  errorHandler: ErrorHandler<ErrorResponse>
): Middleware<{ headers: t.TypeOf<Codec> }, ErrorResponse>

function cookiesP<
  Codec extends t.Type<any>,
  ErrorResponse extends Response.Response<number, any, any>
>(
  codec: Codec,
  errorHandler: ErrorHandler<ErrorResponse>
): Middleware<{ cookies: t.TypeOf<Codec> }, ErrorResponse>
```

If you want to abstract your custom error handling to reuse it in multiple
routes, you can create your own parser functions like this:

```typescript
import * as t from 'io-ts'

function errorToString(err: t.Errors): string {
  // Turn err to string the way you like
}

const myQuery = <T>(
  codec: t.Type<T>
): Middleware<{ body: T }, Response.BadRequest<string>> =>
  Parser.queryP(codec, (errors) => Response.badRequest(errorToString(errors)))

// You can alse return a different response than 400 Bad Request
const myBody = <T>(
  codec: t.Type<T>
): Middleware<{ body: T }, Response.Conflict<string>> =>
  Parser.bodyP(codec, (errors) => Response.conflict(errorToString(errors)))

// etc...
```

### Using express middleware

_This is an experimental feature, and is currently available only for
`typera-express`. It can change without a corresponding semver bump._

Express middleware is inherently incompatible with typera middleware, because
typera runs its middlewares independently of the Express middleware. This makes
it possible to pass typed data to the next middleware and the route handler.

However, lots of useful Express middleware already exists out there.
`typera-express` has a function that helps you wrap existing Express middleware
in a way that it works (mostly) like typera middleware does:

#### `wrapNative`

Signatures:

- `Middleware.wrapNative(expressMiddleware)`
- `Middleware.wrapNative(expressMiddleware, mapResult)`

Given Express middleware function `expressMiddleware`, return the corresponding
typera middleware.

If the `mapResult` function is given, its called after the middleware has run,
and its return value is merged to the typera request object. Use this function
to take any data the wrapped middleware produces and make it consumable by other
typera middleware or the route handler function.

The wrapped Express middleware may either pass the control to the next
middleware (or route handler) in the chain by calling `next()`, the third
parameter of the middleware function, or send the response and end the
middleware chain. Some middleware use various tricks to hook to the point where
the response is eventually sent, to e.g. log info about it. `wrapNative` tries
to make all of this possible, but there might be corner cases which don't work
yet.

## Routes

```typescript
import { Route, URL, applyMiddleware, route } from 'typera-express'
// or
import { Route, URL, applyMiddleware, route } from 'typera-koa'
```

### `route`

A route matches a request based on HTTP method and path, and defines a function
that serves a response for the matched request.

Routes are created using the `route.[method](...)` or `route(method, ...)`,
where method is one of `get`, `post`, `put`, `delete`, `head`, `options`,
`patch` or `all`:

```typescript
route
  .get(path)
  .use(middleware1, middleware2 /*, ... */)
  .handler(async (request) => {
    // ...
    return Response.ok()
  })
```

The special method `all` matches every HTTP method.

The `route` functions take a path pattern as an argument. The path pattern can
contain [route parameter captures](#route-parameter-capturing). The path if the
incoming HTTP request is matched against the path pattern to see whether this
route is responsible for serving the response for the HTTP request.

They return an object with `.use()` and `.handler()` methods.

The `.use()` method takes one or more [middleware functions](#middleware) which
are used to process the incoming request and create the typera request object
(`request`). You can call `.use()` many times. The result of middleware in
previous calls will be available in the typera request object passed to the next
middleware. See [`ChainedMiddleware`](#chainedmiddleware) above on how to use
the previous middleware results in the next middleware.

The `.handler()` method takes a request handler, which is an async function that
receives the typera request object returns a response.

The typera request object is created by merging the
[route parameters](#route-parameter-capturing) and the result objects of
[middleware functions](#middleware) given to `route` or applied before. It also
always extends the request base:

```typescript
// typera-express
export type RequestBase = {
  req: express.Request
  res: express.Response
}

// typera-koa
export type RequestBase = {
  ctx: koa.Context
}
```

In other words, in `typera-express` the [Express] req/res are always available
as `request.req` and `request.res`, and in `typera-koa` the [Koa] context is
always available as `request.ctx`.

The type of `request` is inferred by typera, so there's no need for the user to
give it an explicit type, while at the same time the TypeScript compiler checks
that the properties of `request` are used correctly in the request handler.

`route` infers the response type by combining the error response types of all
middleware functions, and the response types of the request handler. To get
maximum type safety, you should explicitly declare the return type of `route` in
your code. This makes sure that the possible responses of a route don't change
unexpectedly because of changes in the code, and documents all the possible
responses from a single route:

```typescript
const listHandler: Route<Response.Ok<User> | Response.BadRequest<string>> =
  route
    .get(/* ... */)
    .use(/* ... */)
    .handler(async (request) => {
      // ...
    })
```

We avoid giving the accurate type of the various `route` functions here, because
they're quite complex due to the type inference of `request` and response types.
Interested readers can refer to the code:
[common](https://github.com/akheron/typera/tree/main/packages/typera-common/src/index.ts),
[express](https://github.com/akheron/typera/tree/main/packages/typera-express/index.ts),
[koa](https://github.com/akheron/typera/tree/main/packages/typera-koa/index.ts),

### `route.use`

### `applyMiddleware`

Signatures:

- `route.use(...middlewares)`
- `applyMiddleware(...middlewares)`

If you need to apply the same middleware to many routes, you can create your own
version of `route` by calling either `route.use()` or `applyMiddleware()` with
the middleware that are common to all of the routes:

```typescript
// db and auth are middleware functions
const myRoute = route.use(db, auth)
// or
const myRoute = route.use(db).use(auth)
// or
const myRoute = applyMiddleware(db, auth)

const listHandler: Route<...> = myRoute.get(...)
const updateHandler: Route<...> = myRoute.put(...)
```

The value returned by `route.use()` and `applyMiddleware()` works exactly the
same as `route` i.e. it has the `.get()`, `.post()` etc. methods and can be
called directly.

## Route parameter capturing

Path patterns make it possible to extract some parts of the HTTP request path
for use in the route handler.

For example, with the following path:

```typescript
route.get('/user/:id(int)').handler(async (request) => { ... })
```

In the route handler function, `req.routeParams.id` will contain the integer
that was given after `/user/`, like this:

| Path           | `req`                            |
| -------------- | -------------------------------- |
| `/user/5`      | `{ routeParams: { id: 5 }}`      |
| `/user/528472` | `{ routeParams: { id: 528472 }}` |
| `/user/foo`    | Route is not matched             |
| `/user/5/`     | Route is not matched             |
| `/user/`       | Route is not matched             |

Route parameters have the syntax `:name` or `:name(conv)`, where the optional
`(conv)` specifies a conversion to be applied to the parameter. Without a
conversion, the parameter is captured as a string.

Parameter names should only contain the `a-z`, `A-Z` and `_` characters. They
can be separated with `-` and `.`, so these are valid path patterns:

- `/flights/:from-:to`
- `/plantae/:genus.:species`

One built-in conversion is available: `(int)` converts the parameter to a
(non-negative) integer, or fails to match if something else than an integer is
supplied.

### `useParamConversions`

Signature: `route.useParamConversions({ ...convs })`

`import * as Option from 'fp-ts/lib/Option`

You can register your own conversions by calling `useParamConversions`. It has
one argument, an object of `{ name: conversion }`, where `name` specifies the
name of the conversion and `conversion` is a function
`(value: string) => Option.Option<T>`. If the function returns a `some`, the
value will be available under the `name` key in `request.routeParams`. If it
returns a `none`, the route will return a `404 Not Found` response.

The value returned by `route.useParamConversions()`works exactly the same as
`route` i.e. it has the `.get()`, `.post()` etc. methods and can be called
directly.

Example:

```typescript
const silly: URL.Conversion<boolean> = (value) => Option.some(value === 'silly')

const funny: URL.Conversion<number> = (value) =>
  value === 'funny' ? Option.some(42) : Option.none

const myRoute = route.useParamConversions({ silly, funny })

const funnyRoute = myRoute
  .get('/foo/:param(silly)/:other(funny)')
  .handler((request) => {
    // request.routeParams is { silly: boolean, funny: number }
  })
```

## Router

```typescript
import { router } from 'typera-express'
// or
import { router } from 'typera-koa'
```

The router is used to take a bunch of routes and turn them into a handler that
you can then attach to your [Express] or [Koa] app.

Available functions:

- `router(...routes)`
- `r.add(...routes)`
- `r.handler()`

Use the `router()` function to create a router. Give it zero or more routes to
add.

The `.add()` method adds more routes to the router. Note that it returns a
**new** `Router` instance instead of modifying the existing one.

The `.handler()` method returns a handler that can be passed to `app.use()` for
both [Express] and [Koa].

With [Express], you can mount the handler to a sub-path like this:

```typescript
import * as express from 'express'

const app = express()
// ...

app.use('/subpath', router.handler())
```

With [Koa], you need to use [koa-mount] to mount your routes to a sub-path:

```typescript
import * as Koa from 'koa'
import mount = require('koa-mount')

const app = new Koa()
// ...

app.use(mount('/subpath', router.handler()))
```

[body-parser]: https://github.com/expressjs/body-parser
[express]: https://expressjs.com/
[io-ts]: https://github.com/gcanti/io-ts
[io-ts-types]: https://github.com/gcanti/io-ts-types
[koa]: https://koajs.com/
[koa-bodyparser]: https://github.com/koajs/bodyparser
[koa-mount]: https://github.com/koajs/mount
