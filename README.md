# typera - Type-safe routes

[![CircleCI](https://circleci.com/gh/akheron/typera.svg?style=shield)](https://circleci.com/gh/akheron/typera)

Typera (**TYPE**d **R**outing **A**ssistant) helps you build route
handlers in a type-safe manner by leveraging [io-ts] and some
TypeScript type inference magic. It works with both [Express] and [Koa].

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [The Problem](#the-problem)
- [Tutorial](#tutorial)
- [API Reference](#api-reference)
  - [Responses](#responses)
  - [Request Parsers](#request-parsers)
  - [Route handlers](#route-handlers)
  - [Integration with the router](#integration-with-the-router)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## The Problem

When you see an `any`, you cannot really be sure anymore. When
building web backends, there are quite a few `any`s involved:

- You get a request in. Captured route params, query params from the
  URL and request body are all `any`.

- When generating a response, the response body's type is `any`.

- The response status is a `number`. It's not as bad as `any`, but
  your routes always return responses from a known set of possible
  status code / body combinations.

By default, the compiler cannot help you with any (pun intended) of
this. But with [typera], you're safe!

## Tutorial

Install [typera] with yarn or npm.

For [Koa]:

```shell
yarn add koa koa-router typera-koa
# or
npm install --save koa koa-router typera-koa
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
import { RouteHandler, Parser, Response, routeHandler, run } from 'typera-koa'
```

Define your route handlers with their response types:

```typescript
interface User {
  id: number
  name: string
  age: number
}

const listUsers: RouteHandler<
  | Response.Ok<User[]>
> = routeHandler(/* ... */)

const createUser: RouteHandler<
  | Response.Ok<User>
  | Response.BadRequest<string>
> = routeHandler(/* ... */)

const updateUser: RouteHandler<
  | Response.Ok<User>
  | Response.NotFound
  | Response.BadRequest<string>
> = routeHandler(/* ... */)
```

The types in the `typera.Response` namespace correspond to HTTP status
codes, and their type parameter denotes the type of the response body.
All the standard statuses are covered, and you can also have custom
ones like this: `Response.Response<418, string>`

You should always annotate the route handler response types like
above. The compiler infers the possible response types, but the result
may be wrong unless you tell the compiler what you expect.

Next, use [io-ts] with some help from [io-ts-types] to create
validators for the incoming request data.

```typescript
import * as t from 'io-ts'
import { IntFromString } from 'io-ts-types/lib/IntFromString'

// Decodes an object { name: string, age: number }
const userBody = t.type({ name: t.string, age: t.number })

// Converts { id: string } to { id: number }, and ensures that id
// is actually an integer
const id = t.type({ id: IntFromString })
```

Pass the validators to `routeHandler`, using the helpers from
`typera.Parser` to specify which part of the request you're decoding.
Continuing with the `updateUser` route handler above:

```typescript
const updateUser: RouteHandler<
  | Response.Ok<User>
  | Response.NotFound
  | Response.BadRequest<string>
> = routeHandler(
  // Use the id decoder for the route parameters
  Parser.routeParams(id),

  // and the userBody decoder for the request body
  Parser.body(userBody)
)(async request => {
  // ...
})
```

The callback function passed last will contain the actual route logic
you're going to write. The function gets as an argument the `request`
that will contain the results of all the decoders you passed. And
what's great is that the data is correctly typed!

In the example above, `request` will have the following inferred type,
and changes to the validators will also update the type of `request`:

```typescript
interface MyRequest {
  routeParams: {
    id: number
  }
  body: {
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
const updateUser: RouteHandler<
  | Response.Ok<User>
  | Response.NotFound
  | Response.BadRequest<string>
> = routeHandler(
  Parser.routeParams(id),
  Parser.body(userBody)
)(async request => {
  // This imaginary function takes the user id and data, and updates the
  // user in the database. If the user does not exist, it returns null.
  const user = updateUserInDatabase(request.routeParams.id, request.body)

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
const updateUser: RouteHandler<
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
const updateUser: RouteHandler<
  // ...
  | Response.BadRequest<string>
>
```

This is because the validation of the request data can fail. The
`Parser.body()` helper produces a `400 Bad Request` response with a
`string` body if the request body doesn't pass validation. Likewise,
the `Parser.routeParams()` helper produces a `404 Not Found` with no
body (`undefined` body) on invalid input, and this was also covered by
the response types of the `updateUser` route handler. To customize the
returned error responses, use the `P` suffixed versions of the parser
functions (`Parser.bodyP()`, `Parser.routeParamsP()`, etc.)

There's one piece still missing: adding our route handlers to the
router! For this, we need to pass the route handlers through the
`run()` function. It handles converting the [typera] reponse object to
the underlying framework's response.

Here's an example for [Koa]:

```typescript
import * as Router from 'koa-router'

const router = new Router()

router
  .get('/', run(listUsers))
  .post('/', run(createUser))
  .put('/:id', run(updateUser))
```

And for [Express]:

```typescript
import * as express from 'express'

const app = express()

app.get('/', run(listUsers))
app.post('/', run(createUser))
app.put('/:id', run(updateUser))
```

Remember how the `updateUser` route handler used the `id` route
parameter? The route definition in the above examples is where it
comes from. If you need multiple route parameters, adjust the decoder
passed to `routeParams` accordingly.

## API Reference

### Responses

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

All response types have the `Body` and `Headers` type parameters, both
defaulting to `undefined`. All response constructor functions have the
same 3 signatures.

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

### Request Parsers

```typescript
import { Parser } from 'typera-koa'
// or
import { Parser } from 'typera-express'
```

A request parser is a function that takes the [Koa] context (in
`typera-koa`) or [Express] req/res (in `typera-express`) as a
parameter, and returns either a `Response` on error, or an object when
successful). [fp-ts] `Either` is used to support multiple return
types.

```typescript
// typera-koa
type Input = koa.Context

// typera-express
type Input = {
  req: express.Request
  res: express.Response
}

type Parser<
  Output extends {},
  ErrorResponse extends Response.Response<number, any, any>
> = (input: Input) => Either<ErrorResponse, Output>
```

[typera] provides functions to build request parsers for captured
route params, query string, and request body. These functions take an
[io-ts] codec (`t.Type`) and return a request parser that validates
the corresponding part of the request using the given codec. If the
validation fails, they produce an error response with appropriate
status code and error message in the body.

```typescript
function routeParams<Codec extends t.Type<any>>(codec: Codec):
  Parser<{ routeParams: t.TypeOf<Codec> }, Response.NotFound>

function query<Codec extends t.Type<any>>(codec: Codec):
  Parser<{ query: t.TypeOf<Codec> }, Response.BadRequest<string>>

function body<Codec extends t.Type<any>>(codec: Codec):
  Parser<{ body: t.TypeOf<Codec> }, Response.BadRequest<string>>
```

Note that when a validation error occurs, `routeParams` produces a 404
Not Found response, while `query` and `body` produce a 400 Bad Request
response.

Each of the above functions also have a `P` flavor that allows the
user to override error handling. In addition to an [io-ts] codec,
these functions take an error handler function that receives an
[io-ts] validation error and produces an error response:

```typescript
type ErrorHandler<ErrorResponse extends Response.Response<number, any, any>> =
  (errors: t.Errors) => ErrorResponse

function routeParamsP<
  Codec extends t.Type<any>,
  ErrorResponse extends Response.Response<number, any, any>
>(
  codec: Codec,
  errorHandler: ErrorHandler<ErrorResponse>
): Parser<{ routeParams: t.TypeOf<Codec> }, ErrorResponse>

function queryP<
  Codec extends t.Type<any>,
  ErrorResponse extends Response.Response<number, any, any>
>(
  codec: Codec,
  errorHandler: ErrorHandler<ErrorResponse>
): Parser<{ query: t.TypeOf<Codec> }, ErrorResponse>

function bodyP<
  Codec extends t.Type<any>,
  ErrorResponse extends Response.Response<number, any, any>
>(
  codec: Codec,
  errorHandler: ErrorHandler<ErrorResponse>
): Parser<{ body: t.TypeOf<Codec> }, ErrorResponse>
```

### Route handlers

```typescript
import { RouteHandler, routeHandler } from 'typera-koa'
// or
import { RouteHandler, routeHandler } from 'typera-express'
```

A route handler is a function that takes the [Koa] context (in
`typera-koa`) or [Express] req/res (in `typera-express`) as a
parameter. It returns a promise of a response.

Route handlers can be created using the `routeHandler` function. It is used like this:

```typescript
routeHandler(
  parser1, parser2, ...
)(async req => {
  ...
  return Response.ok()
})
```

Formally, it takes zero or more [request parsers](#request-parsers)
(`parser1, parser2, ...`) which are used to validate the incoming
request and create the [typera] request object (`req`). It returns a
function that takes a request handler. This latter function returns
the final route handler.

The request handler is a function that receives the [typera] request
object (`req`) and returns a response (`req => { return Response.ok()
}` in the above example).

The [typera] request object is created by merging the output objects
of [request parsers](#request-parsers) given to `routeHandler`. It
also always extends the request base:

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
response types of all parsers, and the response types of the request
handler. To get maximum type safety, the return type of of
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

### Integration with the router

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
function run<Response extends Response.Response<number, any, any>>(
  handler: RouteHandler<Response>
): (ctx: koa.Context) => Promise<void>
```

Example of usage:

```typescript
import * as Router from 'koa-router'
import { run } from 'typera-koa'

const router = new Router()
router.get('/', run(listHandler))
```

In `typera-express`, `run` has the following signature:

```typescript
function run<Response extends Response.Response<number, any, any>>(
  handler: RouteHandler<Response>
): (req: express.Request, res: express.Response) => Promise<void>
```

Example of usage:

```typescript
import * as express from 'express'
import { run } from 'typera-express'

const app = express()

app.get('/', run(listHandler))
```

[typera]: https://github.com/akheron/typera
[fp-ts]: https://github.com/gcanti/fp-ts
[io-ts]: https://github.com/gcanti/io-ts
[io-ts-types]: https://github.com/gcanti/io-ts-types
[Express]: https://expressjs.com/
[Koa]: https://koajs.com/
[koa-router]: https://github.com/ZijianHe/koa-router
