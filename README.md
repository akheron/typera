# typera - Type-safe routes

[![CircleCI](https://circleci.com/gh/akheron/typera.svg?style=shield)](https://circleci.com/gh/akheron/typera)

Typera (**TYPE**d **R**outing **A**ssistant) helps you build backends
in a type-safe manner by leveraging [io-ts] and some TypeScript type
inference magic. It works with both [Express] and [Koa].

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [The Problem](#the-problem)
- [Tutorial](#tutorial)
- [API Reference](#api-reference)
  - [Imports](#imports)
  - [Responses](#responses)
  - [Redirects](#redirects)
    - [`Response.redirect<Status>(status: Status, location: string): Response.Response<Status, string, { location: string }>`](#responseredirectstatusstatus-status-location-string-responseresponsestatus-string--location-string-)
  - [Middleware](#middleware)
    - [`Middleware.next([value[, finalizer]])`](#middlewarenextvalue-finalizer)
    - [`Middleware.stop(response)`](#middlewarestopresponse)
  - [Request Parsers](#request-parsers)
    - [`Parser.query<T>(codec: t.Type<T>): Middleware<{ query: T }, Response.BadRequest<string>>`](#parserquerytcodec-ttypet-middleware-query-t--responsebadrequeststring)
    - [`Parser.body<T>(codec: t.Type<T>): Middleware<{ body: T }, Response.BadRequest<string>>`](#parserbodytcodec-ttypet-middleware-body-t--responsebadrequeststring)
    - [~`Parser.routeParams<T>(codec: t.Type<T>): Middleware<{ routeParams: T }, Response.NotFound>`~ (deprecated)](#parserrouteparamstcodec-ttypet-middleware-routeparams-t--responsenotfound-deprecated)
    - [Customizing the error response](#customizing-the-error-response)
  - [Routes](#routes)
    - [`route`](#route)
      - [`route.get(...): Route<Response>`](#routeget-routeresponse)
      - [`route.post(...): Route<Response>`](#routepost-routeresponse)
      - [`route.put(...): Route<Response>`](#routeput-routeresponse)
      - [`route.delete(...): Route<Response>`](#routedelete-routeresponse)
      - [`route.head(...): Route<Response>`](#routehead-routeresponse)
      - [`route.options(...): Route<Response>`](#routeoptions-routeresponse)
      - [`route.patch(...): Route<Response>`](#routepatch-routeresponse)
      - [`route.all(...): Route<Response>`](#routeall-routeresponse)
      - [`route(method, ...): Route<Response>`](#routemethod--routeresponse)
    - [`route.use(...middleware)`](#routeusemiddleware)
    - [`applyMiddleware(...middleware)`](#applymiddlewaremiddleware)
  - [URL parameter capturing](#url-parameter-capturing)
    - [`URL.str(name: string)`](#urlstrname-string)
    - [`URL.int(name: string)`](#urlintname-string)
  - [Router](#router)
    - [`router(...routes: Route<any>[]): Router`](#routerroutes-routeany-router)
    - [`Router.add(...routes: Route<any>[]): Router`](#routeraddroutes-routeany-router)
    - [`Router.handler()`](#routerhandler)
  - [~Route handlers~ (deprecated)](#route-handlers-deprecated)
  - [~Integration with the app~ (deprecated)](#integration-with-the-app-deprecated)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## The Problem

When you see an `any`, you cannot really be sure anymore. When
building web backends, there are quite a few `any`s involved:

- You get a request in. Captured route params, query params from the
  URL and request body are all `any`.

- When generating a response, the response body's type is `any`.

- Usually, when middleware is involved, there's no type-level
  visibility to which transforms the middleware apply to the request,
  or which responses it might return.

- The response status is a `number`. It's not as bad as `any`, but
  your routes always return responses from a known set of possible
  status code / body combinations.

By default, the compiler cannot help you with any (pun intended) of
this. But with [typera], you're safe!

## Tutorial

Install [typera] with yarn or npm.

For [Koa]:

```shell
yarn add koa typera-koa
# or
npm install --save koa typera-koa
```

For [Express]:

```shell
yarn add express typera-express
# or
npm install --save express typera-express
```

Import the things we need:

```typescript
// Change 'typera-koa' to 'typera-express' if you're using Express
import { Parser, Response, Route, URL, route } from 'typera-koa'
```

Define your routes with their response types:

```typescript
interface User {
  id: number
  name: string
  age: number
}

const listUsers: Route<
  | Response.Ok<User[]>
> = route('get', '/user')(/* ... */)

const createUser: Route<
  | Response.Ok<User>
  | Response.BadRequest<string>
> = route('post', '/user')(/* ... */)

const updateUser: Route<
  | Response.Ok<User>
  | Response.NotFound
  | Response.BadRequest<string>
> = route('put', '/user/', URL.int('id'))(/* ... */)
```

The first argument of `route()` is a HTTP method, and rest are path
segments. Any of the segments can capture a part of the path, like
`URL.int('id')` above. The `'id'` argument is the name of the
parameter, more on that later.

The types in the `typera.Response` namespace correspond to HTTP status
codes, and their type parameter denotes the type of the response body.
All the standard statuses are covered, and you can also have custom
ones like this: `Response.Response<418, string>`

You should probably annotate the route handler response types like
above. While it's not required, it helps you catch bugs if you
accidentally change the result data of a route. By annotating what you
actually wanted to return, you let the compiler notice if reality
doesn't match the expectations.

Next, use [io-ts] to create validators for the incoming request data.

```typescript
import * as t from 'io-ts'

// Decodes an object { name: string, age: number }
const userBody = t.type({ name: t.string, age: t.number })
```

Pass the validators to `route`, using the helpers from
`typera.Parser` to specify which part of the request you're decoding.
Continuing with the `updateUser` route handler above:

```typescript
const updateUser: Route<
  | Response.Ok<User>
  | Response.NotFound
  | Response.BadRequest<string>
> = route('put', '/user/', URL.int('id'))(
  // Use the userBody decoder for the request body
  Parser.body(userBody)
)(async request => {
  // ...
})
```

The callback function passed last will contain the actual route logic
you're going to write. The function gets as an argument the `request`
that will contain all URL captures as well as all the results of the
decoders you passed. And what's great is that the data is correctly
typed!

In the example above, `request` will have the following inferred type,
and changes to the validators will also update the type of `request`:

```typescript
interface MyRequest {
  routeParams: {
    // These are the URL captures, id was the name passed to URL.int()
    id: number
  }
  body: {
    // This is the output of the userBody decoder
    name: string
    age: number
  }

  // With typera-koa
  ctx: koa.Context

  // With typera-express
  // req: express.Request
  // res: express.Response
}
```

(In reality the type won't be exatly as above, but a bit more complex
intersection type instead. In any case, it can be used as if it was
like above, editor autocomplete will work correctly, etc.)

Let's continue by writing the actual route logic:

```typescript
const updateUser: Route<
  | Response.Ok<User>
  | Response.NotFound
  | Response.BadRequest<string>
> = route('put', '/user/', URL.int('id'))(
  // Use the userBody decoder for the request body
  Parser.body(userBody)
)(async request => {
  // This imaginary function takes the user id and data, and updates the
  // user in the database. If the user does not exist, it returns null.
  const user = await updateUserInDatabase(request.routeParams.id, request.body)

  if (user != null) {
    return Response.ok({ id: user.id, name: user.name, age: user.age })
  }

  return Response.notFound()
})
```

The above code returns either `200 OK` with the user data in the body,
or `404 Not Found` without any body, depending on whether the user was
found in the database or not.

Note that the OK response body corresponds to the `User` type we
defined earlier. We annotated the route handler to return a `User`
body with the OK response:

```typescript
const updateUser: Route<
  | Response.Ok<User>
  // ...
>
```

Let's assume we made a typo in our code and wrote `ic` instead of
`id`:

```typescript
return Response.ok({ ic: user.id, name: user.name, age: user.age })
// OOPS! -------------^
```

The TypeScript compiler catches this and gives you an error. Likewise,
if in the future someone changes the `updateUserFromDatabase` function
and e.g. adds a new field to the user data that the function takes as
the second argument, the code won't compile before they also fix the
`userBody` decoder to match the new type.

It's not required to use the response helpers like `Response.ok()` or
`Response.notFound()`. You can also return plain objects: `return {
status: 200, body: { ... }, headers: { ... } }`

Did you notice that the `updateUser` route handler also had a
`Response.BadRequest<string>` as a possible response?

```typescript
const updateUser: Route<
  // ...
  | Response.BadRequest<string>
>
```

This is because the validation of the request data can fail. The
`Parser.body()` middleware produces a `400 Bad Request` response with
a `string` body if the request body doesn't pass validation. To
customize the returned error responses, use the `P` suffixed versions
of the parser functions (`Parser.bodyP()`, `Parser.routeParamsP()`,
etc.). See [Request Parsers](#request-parsers) below for more
information.

There's one piece still missing: adding our route handlers to the app.
Use the `router()` function to create a router from a bunch of routes,
and the `.handler()` method of the router to get a handler that can be
added to the app.

Here's an example for [Koa]:
```typescript
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import { router } from 'typera-koa'

const app = new Koa()

// koa-bodyparser is needed if you use Parser.body()
app.use(bodyParser())

app.use(router(listUsers, createUser, updateUser).handler())
```

And for [Express]:

```typescript
import * as express from 'express'
import * as bodyParser from 'body-parser'
import { router } from 'typera-express'

const app = express()

// body-parser is needed if you use Parser.body()
app.use(bodyParser.json())

app.use(router(listUsers, createUser, updateUser).handler())
```

## API Reference

### Imports

[typera] exposes its contents in various modules, e.g. `Response`,
`Middleware`, `Parser`, etc. In the examples below, they are imported
from the top-level module like this:

```typescript
import { Response, Middleware, Parser } from 'typera-koa'
// or
import { Response, Middleware, Parser } from 'typera-express'
```

You can also import from the individual modules:

```typescript
import * as Response from 'typera-koa/response'
import * as Middleware from 'typera-koa/middleware'
import * as Parser from 'typera-koa/parser'
// or
import * as Response from 'typera-express/response'
import * as Middleware from 'typera-express/middleware'
import * as Parser from 'typera-express/parser'
```

And of course, you can also import individual items when importing
directly from the modules:

```typescript
import { BadRequest } from 'typera-koa/response'
// or
import { BadRequest } from 'typera-koa/express'
```

### Responses

All response related types and functions live in the `Response`
namespace.

```typescript
import { Response } from 'typera-koa'
// or
import { Response } from 'typera-express'
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

There is a separate type and a function to construct a response of
that type for each valid HTTP status code.

For example, the response type for a 200 OK response is:

```typescript
type Ok<
  Body = undefined,
  Headers extends OptionalHeaders = undefined
> = Response<200, Body, Headers>
```

The function to construct a 200 OK response has the following overloaded signatures:

```typescript
function ok(): Ok
function ok<Body>(body: Body): Ok<Body>
function ok<Body, Headers extends OptionalHeaders>(body: Body, headers: Headers): Ok<Body, Headers>
```

All response types have the `Body` and `Headers` type parameters. With
other than [redirect responses](#redirects), both default to
`undefined`. All response constructor functions have the same 3
signatures.

Here's a list of most common responses:

| HTTP | Type | Constructor function |
| ---- | ---- | -------------------- |
| 200 OK | `Ok` | `ok` |
| 201 Created | `Created` | `created` |
| 204 No Content | `NoContent` | `noContent` |
| 301 Moved Permanently | `MovedPermanently` | `movedPermanently` |
| 302 Found | `Found` | `found` |
| 304 Not Modified | `NotModified` | `notModified` |
| 400 Bad Request | `BadRequest` | `badRequest` |
| 401 Unauthorized | `Unauthorized` | `unauthorized` |
| 403 Forbidden | `Forbidden` | `forbidden` |
| 404 Not Found | `NotFound` | `notFound` |
| 405 Method Not Allowed | `MethodNotAllowed` | `methodNotAllowed` |

For the full list of supported responses, see
[response.ts](packages/typera-common/src/response.ts).

### Redirects

Redirecting the client to another URL is a common thing to and requires
setting a header. To create a redirect response, use the
`redirect(status, location)` helper:

```
const myHandler: Route<Response.MovedPermanently> =
  route.get('/foo')()(async req => {
    return Response.redirect(301, '/bar')
  })
```

This generates a response with a string body and the `Location` header
set:

```
HTTP/1.1 301 Moved Permanently
Location: /bar

Moved premanently. Redirecting to /bar
```

For simplicity, the redirecting responses listed below have the default
body type of `string` and the default headers type of `{ location:
string }`:

| HTTP | Type | Constructor function |
| -----| ---- | -------------------- |
| 301 Moved Permanently | `MovedPermanently` | `redirect(301, location)` |
| 302 Found | `Found` | `redirect(302, location)` |
| 303 See Other | `SeeOther` | `redirect(303, location)` |
| 307 Temporary Redirect | `TemporaryRedirect` | `redirect(307, location)` |
| 308 Permanent Redirect | `PermanentRedirect` | `redirect(308, location)` |

Use the "normal" constructor functions (`movedPermanently()`, `found()`,
...) if you want full control over the body and headers.

#### `Response.redirect<Status>(status: Status, location: string): Response.Response<Status, string, { location: string }>`

Create a response that redirects to the given location. The response
body will be a textual explanation of the redirect.

### Middleware

```typescript
import * as Either from 'fp-ts/lib/Either'
import { Middleware } from 'typera-koa'
// or
import { Middleware } from 'typera-express'
```

Middleware are asynchronous functions that take the [Koa] context (in
`typera-koa`) or [Express] req/res (in `typera-express`) as a
parameter, and return either a `Response` or an object.

If a middleware function returns a `Response`, then the request
handling is stopped and that response is sent to the client. If it
returns an object, that object is merged to the [typera] request
object which is passed to the route handler.

When the middleware function returns an object, it can also add a
finalizer function to be called after the request handler has
finished. This is useful if the middleware allocates some resources
that need to be released afterwards (e.g. release a database
connection, delete a temporary file, etc.)

For example, here's a middleware that authenticates a user and adds
user info to the [typera] request object:

```typescript
const authenticateUser: Middleware.Middleware<{ user: User }, Response.Unauthorized<string>> =
  //                                          ^               ^
  //                                          |               |
  // This is the object that's merged to request              |
  //                                                          |
  //                   This is the response that may be returned by the middleware
  //
  //
  async (ctx: koa.Context) => {   // ({ req, res }) for typera-express
    const user = await authenticateUser(ctx)  // Gets a user somehow and returns null if unauthenticated
    if (!user) {
      return Middleware.stop(Response.unauthorized('Login first'))
    }
    return Middleware.next({ user })
  }
```

Another example of a middleware that adds a database client to the
[typera] request object. It never fails, so the response type is
`never`.

```typescript
import * as pg from 'pg'

const pool = new pg.Pool()

const db: Middleware.Middleware<{ connection: pg.ClientBase }, never> = async () => {
  const connection = await pool.connect()
  return Middleware.next({ connection }, () => connection.release())
}
```

If you write a middleware that adds nothing to the [typera] request
object, its result type should be `{}`:

```typescript
const checkSomething: Middleware.Middleware<{}, Response.BadRequest<string>> = ...
```

#### `Middleware.next([value[, finalizer]])`

Construct a value to be merged with the [typera] request object, and
optionally add a finalizer to be run when the request processing has
finished.

If `Middleware.next()` is called with no arguments, nothing is added
to the [typera] request object (the middleware result type will be an
empty object `{}`).

The finalizer, if given, is called with no arguments. It can be an
async function (can return a `Promise`).

#### `Middleware.stop(response)`

Stop processing the request and return `response` to the client. Other
middleware or the route handler will not be run. If other middleware
has already run before this one, their finalizers are run.

### Request Parsers

Request parsers are built-in middleware that let you validate parts of
the request. All request parser related types and functions live in
the `Parser` namespace.

```typescript
import * as t from 'io-ts'
import { Parser } from 'typera-koa'
// or
//import { Parser } from 'typera-express'
```

[typera] provides functions to build request parser middleware for
query string, and request body. These functions take an [io-ts] codec
(`t.Type`) and return a middleware that validates the corresponding
part of the request using the given codec. If the validation fails,
they produce an error response with appropriate status code and error
message in the body.

#### `Parser.query<T>(codec: t.Type<T>): Middleware<{ query: T }, Response.BadRequest<string>>`

Validate the query string according to the given [io-ts] codec.
Respond with `400 Bad Request` if the validation fails.

The input for this parser will be the query string parsed as `{ [K in
string]: string }`, i.e. all parameter values will be strings. If you
want to convert them to other types, you probably find the
`XFromString` codecs from [io-ts-types] useful (e.g. `IntFromString`,
`BooleanFromString`, etc.)

#### `Parser.body<T>(codec: t.Type<T>): Middleware<{ body: T }, Response.BadRequest<string>>`

Validate the request body according to the given [io-ts] codec.
Respond with `400 Bad Request` if the validation fails.

The input for this parser will be the request body, parsed with the
body parser of your choice. With [Express] you probably want to use
[body-parser], and with [Koa] the most common choice is
[koa-bodyparser]. Note that these are native [Express] or [Koa]
middleware, so you must attach them directly to the [Express] or [Koa]
app rather than use them as [typera] middleware.

#### ~`Parser.routeParams<T>(codec: t.Type<T>): Middleware<{ routeParams: T }, Response.NotFound>`~ (deprecated)

*Deprecated as of v0.4.0*: Only useful with the deprecated
`routeHandler()` and `run()` functions.

Validate the captured route params according to the given [io-ts]
codec. Respond with `404 Not Found` if the validation fails.

#### Customizing the error response

Each of the above functions also have a `P` flavor that allows the
user to override error handling. In addition to an [io-ts] codec,
these functions take an error handler function that receives an
[io-ts] validation error and produces an error response:

```typescript
type ErrorHandler<ErrorResponse extends Response.Response<number, any, any>> =
  (errors: t.Errors) => ErrorResponse

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

// Deprecated
function routeParamsP<
  Codec extends t.Type<any>,
  ErrorResponse extends Response.Response<number, any, any>
>(
  codec: Codec,
  errorHandler: ErrorHandler<ErrorResponse>
): Middleware<{ routeParams: t.TypeOf<Codec> }, ErrorResponse>
```

### Routes

```typescript
import { Route, URL, applyMiddleware, route } from 'typera-koa'
// or
import { Route, URL, applyMiddleware, route } from 'typera-express'
```

#### `route`

A route matches a request based on HTTP method and path, and defines a
function that serves a response for the matched request.

##### `route.get(...): Route<Response>`
##### `route.post(...): Route<Response>`
##### `route.put(...): Route<Response>`
##### `route.delete(...): Route<Response>`
##### `route.head(...): Route<Response>`
##### `route.options(...): Route<Response>`
##### `route.patch(...): Route<Response>`
##### `route.all(...): Route<Response>`
##### `route(method, ...): Route<Response>`

Routes are created using the `route.[method](...)` or `route(method,
...)`, where method is one of `get`, `post`, `put`, `delete`, `head`,
`options`, `patch` or `all`:

```typescript
route.get(pathSegment1, pathSegment2, ...)(
  middleware1, middleware2, ...
)(async req => {
  ...
  return Response.ok()
})
```

The special method `all` matches every HTTP method.

The `route` functions take zero or more path segments as arguments
(`pathSegment1, pathSegment2, ...`). Each path segment can be either a
`string` or an [URL capture](#url-parameter-capturing). They are
concatenated together to form the final URL pattern. The path if the
incoming HTTP request is matched against the URL pattern to see
whether this route is responsible for serving the response for the
HTTP request.

It returns a function that takes zero or more [middleware
functions](#middleware) (`middleware1, middleware2, ...`) which are
used to process the incoming request and create the [typera] request
object (`req`). This function, in turn, returns a function that takes
a request handler. This last function returns the final `Route`
object.

The request handler is a function that receives the [typera] request
object (`req`) and returns a response (`req => { return Response.ok()
}` in the above example).

The [typera] request object is created by merging the [URL
captures](#url-parameter-capturing) and the output objects of
[middleware functions](#middleware) given to `route` or applied
before. It also always extends the request base:

```typescript
// typera-koa
type RequestBase = {
  ctx: koa.Context
}

// typera-express
type RequestBase = {
  req: express.Request
  res: express.Response
}
```

In other words, in `typera-koa` the [Koa] context is always available
via `req.ctx`, and in `typera-express` the [Express] req/res are
always available via `req.req` and `req.res`.

The type of `req` is inferred by [typera], so there's no need for the
user to give it an explicit type, while at the same time the
TypeScript compiler checks that the properties of `req` are used
correctly in the request handler.

`route` infers the response type by combining the error response types
of all middleware functions, and the response types of the request
handler. To get maximum type safety, the return type of of `route` can
be explicitly declared in user code. This makes sure that the possible
responses of a route don't change unexpectedly because of changes in
your code, and documents all the possible responses from a single
route:

```typescript
const listHandler: Route<
  | Response.Ok<User>
  | Response.BadRequest<string>
> = route.get(...)(...)(async req => { ... })
```

We avoid giving the accurate type of the various `route` functions
here, because they're quite complex due to the type inference of `req`
and response types. Interested users can refer to the code:
[common](packages/typera-common/src/index.ts),
[koa](packages/typera-koa/index.ts),
[express](packages/typera-express/index.ts).

#### `route.use(...middleware)`
#### `applyMiddleware(...middleware)`

If you need to apply the same middleware to many routes, you can
create your own version of `route` by calling either `route.use()` or
`applyMiddleware()` with the middleware that are common to all of the
routes:

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

The value returned by `route.use()` and `applyMiddleware()` works
exactly the same as `route` i.e. it has the `.get()`, `.post()` etc.
methods and can be called directly.

### URL parameter capturing

```typescript
import { URL } from 'typera-koa'
```

URL captures make it possible to extract some parts of the HTTP
request path for use in the route handler.

For example, with the following path segments:
```typescript
route('get', '/user/', URL.int('id'))(...)(async req => { ... })
```

In the route handler function, `req.routeParams.id` will contain the
integer that was given after `/user/` in the path (`id` is the name
given to `URL.int()`), like this:

| Path | `req` |
| ---- | ----- |
| `/user/5` | `{ routeParams: { id: 5 }}` |
| `/user/528472` | `{ routeParams: { id: 528472 }}` |
| `/user/foo` | Route is not matched |
| `/user/5/` | Route is not matched |
| `/user/` | Route is not matched |

The following capture functions are available:

#### `URL.str(name: string)`

Capture a path segment as a string. `/` will not be matched, so you
can have more path segments after this one, provided the next one
starts with a `/`.

#### `URL.int(name: string)`

Capture a non-negative integer, matching the regexp `\d+`. The
captured value is converted to `number`.


### Router

```typescript
import { router } from 'typera-koa'
// or
import { router } from 'typera-express'
```

The router is used to take a bunch of routes and turn them into a
handler that you can then attach to your [Express] or [Koa] app.

#### `router(...routes: Route<any>[]): Router`

Use the `router()` function to create a router. Give it zero or more
routes to add.

#### `Router.add(...routes: Route<any>[]): Router`

The `.add()` method adds more routes to the router. Note that it
returns a **new** `Router` instance instead of modifying the existing
one.

#### `Router.handler()`

The `.handler()` method returns a handler that can be passed to
`app.use()` for both [Express] and [Koa] (provided you use
`typera-express` or `typera-koa` matching your framework choice).

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
import mount = require('koa-mount']

const app = new Koa()
// ...

app.use(mount('/subpath', router.handler()))
```

### ~Route handlers~ (deprecated)

*Deprecated as of v0.4.0*: Use `route()` and `router()` instead.

A route handler is a function that takes the [Koa] context (in
`typera-koa`) or [Express] req/res (in `typera-express`) as a
parameter, and a response wrapped in a promise.

Route handlers can be created using the `routeHandler` function. It is used like this:

```typescript
routeHandler(
  middleware1, middleware2, ...
)(async req => {
  ...
  return Response.ok()
})
```

Formally, it takes zero or more [middleware functions](#middleware)
(`middleware1, middleware2, ...`) which are used to process the
incoming request and create the [typera] request object (`req`). It
returns a function that takes a request handler. This latter function
returns the final route handler.

The request handler is a function that receives the [typera] request
object (`req`) and returns a response (`req => { return Response.ok()
}` in the above example).

The [typera] request object is created by merging the output objects
of [middleware function](#middleware) given to `routeHandler`. It also
always extends the request base:

```typescript
// typera-koa
type RequestBase = {
  ctx: koa.Context
}

// typera-express
type RequestBase = {
  req: express.Request
  res: express.Response
}
```

In other words, in `typera-koa` the [Koa] context is always available
via `req.ctx`, and in `typera-express` the [Express] req/res are
always available via `req.req` and `req.res`.

The type of `req` is inferred by [typera], so there's no need for the
user to give it an explicit type, while at the same time the
TypeScript compiler checks that the properties of `req` are used
correctly in the request handler.

`routeHandler` infers the response type by combining the error
response types of all middleware functions, and the response types of
the request handler. To get maximum type safety, the return type of of
`routeHandler` should always be explicitly declared in user code. This
makes sure that the possible responses of a route don't change
unexpectedly because of changes in your code, and documents all the
possible responses from a single route:

```typescript
const listHandler: RouteHandler<
  | Response.Ok<User>
  | Response.BadRequest<string>
> = routeHandler(...)(async req => { ... })
```

We avoid giving the accurate type of `routeHandler` here, because it's
quite complex due to the type inference of `req` and response types.
Interested users can refer to the code:
[common](packages/typera-common/src/index.ts),
[koa](packages/typera-koa/index.ts),
[express](packages/typera-express/index.ts).

### ~Integration with the app~ (deprecated)

*Deprecated as of v0.4.0*: Use `route()` and `router()` instead.

```typescript
import { run } from 'typera-koa'
// or
import { run } from 'typera-express'
```

Use the `run` function to transform the route handler to a function
that can be passed to [koa-router] (with `typera-koa`), or to
[Express] routing functions (with `typera-express`).

In `typera-koa`, `run` has the following signature:

```typescript
function run<Response extends Response.Generic>(
  handler: RouteHandler<Response>
): (ctx: koa.Context) => Promise<void>
```

Example of usage:

```typescript
import * as Router from 'koa-router'
import { run } from 'typera-koa'

const router = new Router()

// Assume that listHandler is a route handler created by routeHandler()
router.get('/', run(listHandler))
```

In `typera-express`, `run` has the following signature:

```typescript
function run<Response extends Response.Generic>(
  handler: RouteHandler<Response>
): (req: express.Request, res: express.Response) => Promise<void>
```

Example of usage:

```typescript
import * as express from 'express'
import { run } from 'typera-express'

const app = express()

// Assume that listHandler is a route handler created by routeHandler()
app.get('/', run(listHandler))
```

[typera]: https://github.com/akheron/typera
[fp-ts]: https://github.com/gcanti/fp-ts
[io-ts]: https://github.com/gcanti/io-ts
[Express]: https://expressjs.com/
[body-parser]: https://github.com/expressjs/body-parser
[Koa]: https://koajs.com/
[koa-bodyparser]: https://github.com/koajs/bodyparser
[koa-mount]: https://github.com/koajs/mount
