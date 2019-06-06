typera - Type-safe routes
=========================

Typera (**TYPE**d **R**outing **A**ssistant) helps you build route
handlers in a type-safe manner by leveraging [io-ts] and some
TypeScript type inference magic. It works with both [Express] and [Koa].

The Problem
-----------

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

Tutorial
--------

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
// Change 'typera-koa' to 'typera-express' is you're using Express
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
ones like this: `Response.Response<418, sting>`

You should always annotate the route handler response types like
above. The compiler infers the possible response types, but the result
may be wrong unless you tell the compiler what you expect.

Next, use [io-ts] to create validators for the incoming request data.

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

  return Response.notFound(undefined)
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
status: 200, body: { ... } }`

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

TODO
----

- Add more status codes to `typera.Response`
- Decode an return headers
- Support Express in addition to Koa, create `typera-koa` and `typera-express` packages
- Add reference docs
- Run tests in CI
- Publish to npm

[typera]: https://github.com/akheron/typera
[io-ts]: https://github.com/gcanti/io-ts
[Express]: https://expressjs.com/
[Koa]: https://koajs.com/
