# typera - Build type-safe web backends

Typera helps you build backends in a type-safe manner by leveraging [io-ts] and
some TypeScript type inference magic. It works with both [Express] and [Koa].

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

Features of typera:

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

## Getting started

Typera requires TypeScript 4.1 or newer and Node 12 or newer.

Install for [Express]:

```shell
yarn add typera-express
# or
npm install typera-express
```

Install for [Koa]:

```shell
yarn add typera-koa
# or
npm install typera-koa
```

Example:

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
  // Optional annotation of possible response types
  Response.Ok<User> | Response.NotFound | Response.BadRequest<string>
> = route
  .put('/user/:id(int)') // Capture id from the path
  .use(Parser.body(userBody)) // Use the userBody decoder for the request body
  .handler(async (request) => {
    // This imaginary function takes the user id and data, and updates the
    // user in the database. If the user does not exist, it returns null.
    const user = await updateUserInDatabase(
      // The stuff inside `request` is fully typed!
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

Got interested? Head to the [tutorial](tutorial.md).

[io-ts]: https://github.com/gcanti/io-ts
[express]: https://expressjs.com/
[koa]: https://koajs.com/
[typera-openapi]: https://github.com/akheron/typera-openapi
