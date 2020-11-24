# typera - Type-safe routes

[![CircleCI](https://circleci.com/gh/akheron/typera.svg?style=shield)](https://circleci.com/gh/akheron/typera)

Typera (**TYPE**d **R**outing **A**ssistant) helps you build backends in a
type-safe manner by leveraging [io-ts] and some TypeScript type inference magic.
It works with both [Express] and [Koa].

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

## Table of Contents

- [The Problem](#the-problem)
- [Tutorial](#tutorial)
- [Requirements](#requirements)
- [API Reference](#api-reference)
  - [Imports](#imports)
  - [Responses](#responses)
  - [Redirects](#redirects)
    - [`Response.redirect<Status>(status: Status, location: string): Response.Response<Status, string, { location: string }>`](#responseredirectstatusstatus-status-location-string-responseresponsestatus-string--location-string-)
  - [Streaming responses](#streaming-responses)
  - [Middleware](#middleware)
    - [`Middleware.next([value[, finalizer]])`](#middlewarenextvalue-finalizer)
    - [`Middleware.stop(response)`](#middlewarestopresponse)
  - [Request parsers](#request-parsers)
    - [`Parser.query<T>(codec: t.Type<T>): Middleware<{ query: T }, Response.BadRequest<string>>`](#parserquerytcodec-ttypet-middleware-query-t--responsebadrequeststring)
    - [`Parser.body<T>(codec: t.Type<T>): Middleware<{ body: T }, Response.BadRequest<string>>`](#parserbodytcodec-ttypet-middleware-body-t--responsebadrequeststring)
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
  - [~Creating routes by function chaining~ (deprecated)](#creating-routes-by-function-chaining-deprecated)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## The Problem

When you see an `any`, you cannot really be sure anymore. When building web
backends, there are quite a few `any`s involved:

- You get a request in. Captured route params, query params from the URL and
  request body are all `any`.

- When generating a response, the response body's type is `any`.

- When middleware is involved, there's no type-level visibility to which
  transforms the middleware apply to the request, or which responses it might
  return.

- The response status is a `number`. It's not as bad as `any`, but your routes
  always return responses from a known set of possible status code / body
  combinations.

By default, the compiler cannot help you with any (pun intended) of this. But
with typera, you're safe!

## Tutorial

Install with yarn or npm.

For [Express]:

```shell
yarn add express typera-express
# or
npm install --save express typera-express
```

For [Koa]:

```shell
yarn add typera-koa
# or
npm install --save koa typera-koa
```

Here's an example of a typed route handler that updates a user's profile in the
database:

```typescript
// Change 'typera-express' to 'typera-koa' if you're using Koa
import { Parser, Response, Route, URL, route } from 'typera-express'
import * as t from 'io-ts'

interface User {
  id: number
  name: string
  age: number
}

// Decodes an object { name: string, age: number }
const userBody = t.type({ name: t.string, age: t.number })

const updateUser: Route<
  Response.Ok<User> | Response.NotFound | Response.BadRequest<string>
> = route
  .put('/user/', URL.int('id')) // Capture id from the path
  .use(Parser.body(userBody)) // Use the userBody decoder for the request body
  .handler(async request => {
    // This imaginary function takes the user id and data, and updates the
    // user in the database. If the user does not exist, it returns null.
    const user = await updateUserInDatabase(
      request.routeParams.id,
      request.body
    )

    if (user === null) {
      return Response.notFound()
    }

    return Response.ok({
      id: user.id,
      name: user.name,
      age: user.age,
    })
  })
```

Let's go through it in detail.

```typescript
// Change 'typera-express' to 'typera-koa' if you're using Koa
import { Parser, Response, Route, URL, route } from 'typera-express'

interface User {
  id: number
  name: string
  age: number
}

// Decodes an object { name: string, age: number }
const userBody = t.type({ name: t.string, age: t.number })
```

We fist import the stuff that is needed, and define an object type that is
returned from the route handler. We also define an [io-ts] codec for decoding
incoming user data.

```typescript
const updateUser: Route<
  Response.Ok<User> | Response.NotFound | Response.BadRequest<string>
> = route /* ... */
```

Then we declare our route's possible responses: `200 OK` with `User` as a body,
`404 Not Found`, or `400 Bad Request` with a `string` body.

The types in the `Response` namespace correspond to HTTP status codes, and their
type parameter denotes the type of the response body. All the standard statuses
are covered, and you can also have custom ones like this:
`Response.Response<418, string>`

You don't need to provide the response types because typera will infer them for
you. But annotating helps you catch bugs if you accidentally change the result
data of a route. By annotating your route with what you actually wanted to
return, you let the compiler notice if reality doesn't match the expectations.

```typescript
route
  .put('/user/', URL.int('id')) // Capture id from the path
  .use(Parser.body(userBody)) // Use the userBody decoder for the request body
  .handler(async request => {
    /* ... */
  })
```

Here we tell that our route is going to handle `PUT` requests. The arguments of
`route.put()` are path segments. Any of the segments can capture a part of the
path, like `URL.int('id')` above. The `'id'` argument is the name of the
parameter (more on that later).

The `.use()` method adds a middleware to the route. The `userBody` [io-ts] codec
was defined above, and passing it to the `Parser.body()` middleware instructs
typera to parse the incoming request body with that codec.

The `.handler()` method adds the actual route logic, and here is where the magic
happens. The function passed to `.handler()` gets as an argument the `request`
object, that will contain all URL captures as well as all the results of the
middleware you passed. And what's great is that the data is correctly typed!

In our example, `request` will have the following inferred type:

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

  // With typera-express
  req: express.Request
  res: express.Response

  // With typera-koa
  //ctx: koa.Context
}
```

(In reality the type won't be exatly as above, but a bit more complex
intersection type instead. In any case, it can be used as if it was like above,
editor autocomplete will work correctly, etc.)

The last part is the actual route logic:

```typescript
route
  .put(/*...*/)
  .use(/*...*/)
  .handler(async request => {
    // This imaginary function takes the user id and data, and updates the
    // user in the database. If the user does not exist, it returns null.
    const user = await updateUserInDatabase(
      request.routeParams.id,
      request.body
    )

    if (user === null) {
      return Response.notFound()
    }

    return Response.ok({
      id: user.id,
      name: user.name,
      age: user.age,
    })
  })
```

The above code returns either `200 OK` with the user data in the body, or
`404 Not Found` without any body, depending on whether the user was found in the
database or not.

Note that the OK response body corresponds to the `User` type we defined
earlier. We annotated the route handler to return a `User` body with the OK
response.

Let's assume we made a typo in our code and wrote `ic` instead of `id`:

```typescript
return Response.ok({ ic: user.id, name: user.name, age: user.age })
// OOPS! -------------^
```

The TypeScript compiler catches this and gives you an error. Likewise, if in the
future someone changes the `updateUserFromDatabase` function and e.g. adds a new
field to the user data that the function takes as the second argument, the code
won't compile before they also fix the `userBody` decoder to match the new type.

It's not required to use the response helpers like `Response.ok()` or
`Response.notFound()`. You can also return plain objects:
`return { status: 200, body: { ... }, headers: { ... } }`

Did you notice that the `updateUser` route handler also had a
`Response.BadRequest<string>` as a possible response even though the route logic
never returns such a response? This is because the validation of the request
body can fail. The `Parser.body()` middleware produces a `400 Bad Request`
response if the request body doesn't pass validation, and this response type is
included as one of the possible response types of the route.

There's one piece still missing: adding our route handlers to the app. Use the
`router()` function to create a router from a bunch of routes, and the
`.handler()` method of the router to get a handler that can be added to the app.

Here's an example for [Express]:

```typescript
import * as express from 'express'
import * as bodyParser from 'body-parser'
import { router } from 'typera-express'

const app = express()

// body-parser is needed if you use Parser.body()
app.use(bodyParser.json())

app.use(router(updateUser /*, otherRoute, stillAnother */).handler())
```

And for [Koa]:

```typescript
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import { router } from 'typera-koa'

const app = new Koa()

// koa-bodyparser is needed if you use Parser.body()
app.use(bodyParser())

app.use(router(updateUser /*, otherRoute, stillAnother */).handler())
```

## Requirements

Requires TypeScript 4.1 or newer.

## API Reference

### Imports

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

### Responses

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
[response.ts](packages/typera-common/src/response.ts).

### Redirects

Redirecting the client to another URL is a common thing to do and requires
setting a header. To create a redirect response, use the
`redirect(status, location)` helper:

```typescript
const myHandler: Route<Response.MovedPermanently> = route
  .get('/foo')
  .handler(async request => {
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

#### `Response.redirect<Status>(status: Status, location: string): Response.Response<Status, string, { location: string }>`

Create a response that redirects to the given location. The response body will
be a textual explanation of the redirect.

### Streaming responses

Use the `Response.StreamingBody` body type and the `Response.streamingBody()`
function to create streaming responses. The function takes a callback that
receives a writable stream as a parameter:

```typescript
const streamingHandler: Route<Response.Ok<Response.StreamingBody>> = route
  .get('/document.pdf')
  .handler(async request => {
    return Response.ok(
      Response.streamingBody(outputStream => {
        // Assuming that the generatePDF function generates a
        // PDF document to the given writable stream
        generatePDF(outputStream)
      })
    )
  })
```

### Middleware

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

const db: Middleware.Middleware<
  { connection: pg.ClientBase },
  never
> = async () => {
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
> = async request => {
  // In typera-express, request.req is the Express request
  if (request.req.get('origin') !== 'example.com') {
    return Middleware.stop(Response.badRequest('Invalid origin'))
  }
  return Middleware.next()
}
```

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
> = async request => {
  await writeAuditLog(request.connection)
  return Middleware.next()
}
```

Now, the `audit` middleware can only be used if the `db` middleware comes before
it and adds `connection` to the request object.

#### `Middleware.next([value[, finalizer]])`

Construct a value to be merged with the typera request object, and optionally
add a finalizer to be run when the request processing has finished.

If `Middleware.next()` is called with no arguments, nothing is added to the
typera request object.

The finalizer, if given, is called with no arguments. It can be an async
function (can return a `Promise`).

If you want to run a finalizer but not add anything to the request, you can pass
`{}` or `undefined` as the value.

#### `Middleware.stop(response)`

Stop processing the request and return `response` to the client. Other
middleware or the route handler will not be run. If other middleware have
already run before this one, their finalizers are run.

### Request parsers

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

#### `Parser.query<T>(codec: t.Type<T>): Middleware<{ query: T }, Response.BadRequest<string>>`

Validate the query string according to the given [io-ts] codec. Respond with
`400 Bad Request` if the validation fails.

The input for this parser will be the query string parsed as
`{ [K in string]: string }`, i.e. all parameter values will be strings. If you
want to convert them to other types, you probably find the `FromString` codecs
from [io-ts-types] useful (e.g. `IntFromString`, `BooleanFromString`, etc.)

#### `Parser.body<T>(codec: t.Type<T>): Middleware<{ body: T }, Response.BadRequest<string>>`

Validate the request body according to the given [io-ts] codec. Respond with
`400 Bad Request` if the validation fails.

The input for this parser will be the request body, parsed with the body parser
of your choice. With [Express] you probably want to use [body-parser], and with
[Koa] the most common choice is [koa-bodyparser]. Note that these are native
[Express] or [Koa] middleware, so you must attach them directly to the [Express]
or [Koa] app rather than use them as typera middleware.

#### Customizing the error response

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
  Parser.queryP(codec, errorToString)

const myBody = <T>(
  codec: t.Type<T>
): Middleware<{ body: T }, Response.BadRequest<string>> =>
  Parser.bodyP(codec, errorToString)

// etc...
```

### Routes

```typescript
import { Route, URL, applyMiddleware, route } from 'typera-express'
// or
import { Route, URL, applyMiddleware, route } from 'typera-koa'
```

#### `route`

A route matches a request based on HTTP method and path, and defines a function
that serves a response for the matched request.

##### `route.get(...): Route<Response>`

##### `route.post(...): Route<Response>`

##### `route.put(...): Route<Response>`

##### `route.delete(...): Route<Response>`

##### `route.head(...): Route<Response>`

##### `route.options(...): Route<Response>`

##### `route.patch(...): Route<Response>`

##### `route.all(...): Route<Response>`

##### `route(method, ...): Route<Response>`

Routes are created using the `route.[method](...)` or `route(method, ...)`,
where method is one of `get`, `post`, `put`, `delete`, `head`, `options`,
`patch` or `all`:

```typescript
route
  .get(pathSegment1, pathSegment2 /*, ... */)
  .use(middleware1, middleware2 /*, ... */)
  .handler(async request => {
    // ...
    return Response.ok()
  })
```

The special method `all` matches every HTTP method.

The `route` functions take zero or more path segments as arguments
(`pathSegment1, pathSegment2, ...`). Each path segment can be either a `string`
or an [URL capture](#url-parameter-capturing). They are concatenated together to
form the final URL pattern. The path if the incoming HTTP request is matched
against the URL pattern to see whether this route is responsible for serving the
response for the HTTP request.

They return an object with `.use()` and `.handler()` methods.

The `.use()` method takes one or more [middleware functions](#middleware)
(`middleware1, middleware2, ...`) which are used to process the incoming request
and create the typera request object (`request`). You can call `.use()` many
times. The result of middleware in previous calls will be available in the
typera request object passed to the next middleware. See `ChainedMiddleware`
above on how to use the previous middleware results in the next middleware.

The `.handler()` method takes a request handler, which is an async function that
receives the typera request object returns a response.

The typera request object is created by merging the
[URL captures](#url-parameter-capturing) and the result objects of
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
const listHandler: Route<
  Response.Ok<User> | Response.BadRequest<string>
> = route
  .get(/* ... */)
  .use(/* ... */)
  .handler(async request => {
    // ...
  })
```

We avoid giving the accurate type of the various `route` functions here, because
they're quite complex due to the type inference of `request` and response types.
Interested users can refer to the code:
[common](packages/typera-common/src/index.ts),
[express](packages/typera-express/index.ts),
[koa](packages/typera-koa/index.ts),

#### `route.use(...middleware)`

#### `applyMiddleware(...middleware)`

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

### URL parameter capturing

```typescript
import { URL } from 'typera-koa'
```

URL captures make it possible to extract some parts of the HTTP request path for
use in the route handler.

For example, with the following path segments:

```typescript
route.get('/user/', URL.int('id')).handler(async (request) => { ... })
```

In the route handler function, `req.routeParams.id` will contain the integer
that was given after `/user/` in the path (`id` is the name given to
`URL.int()`), like this:

| Path           | `req`                            |
| -------------- | -------------------------------- |
| `/user/5`      | `{ routeParams: { id: 5 }}`      |
| `/user/528472` | `{ routeParams: { id: 528472 }}` |
| `/user/foo`    | Route is not matched             |
| `/user/5/`     | Route is not matched             |
| `/user/`       | Route is not matched             |

The following capture functions are available:

#### `URL.str(name: string)`

Capture a path segment as a string. `/` will not be matched, so you can have
more path segments after this one, provided the next one starts with a `/`.

#### `URL.int(name: string)`

Capture a non-negative integer, matching the regexp `\d+`. The captured value is
converted to `number`.

### Router

```typescript
import { router } from 'typera-express'
// or
import { router } from 'typera-koa'
```

The router is used to take a bunch of routes and turn them into a handler that
you can then attach to your [Express] or [Koa] app.

#### `router(...routes: Route<any>[]): Router`

Use the `router()` function to create a router. Give it zero or more routes to
add.

#### `Router.add(...routes: Route<any>[]): Router`

The `.add()` method adds more routes to the router. Note that it returns a
**new** `Router` instance instead of modifying the existing one.

#### `Router.handler()`

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

### ~Creating routes by function chaining~ (deprecated)

_Deprecaded as of v1.0.0_: Use `route(...).use(...).handler(...)` instead.

In typera versions prior to 1.0.0, routes were called with a more bizarre syntax
like this:

```typescript
const updateUser: Route<
  | Response.Ok<User>
  | Response.NotFound
  | Response.BadRequest<string>
> = route('put', '/user/', URL.int('id'))(Parser.body(userBody))(async (request) => {
    ...
  })
```

As you can see, the URL patterns, middleware, and route handler are there, but
you added them by calling functions returned by functions.

In v1.0.0, the `.use()` and `.handler()` were added to make the syntax a lot
nicer, to better support code formatting ([prettier]), and to allow using the
previous middleware result in the next middleware (middleware chaining).

[fp-ts]: https://github.com/gcanti/fp-ts
[io-ts]: https://github.com/gcanti/io-ts
[io-ts-types]: https://github.com/gcanti/io-ts-types
[express]: https://expressjs.com/
[body-parser]: https://github.com/expressjs/body-parser
[koa]: https://koajs.com/
[@koa/router]: https://github.com/koajs/router
[koa-bodyparser]: https://github.com/koajs/bodyparser
[koa-mount]: https://github.com/koajs/mount
[prettier]: https://prettier.io
