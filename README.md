typera - Type-safe routes
=========================

`typera` (**TYPE**d **R**outing **A**ssistant) helps you build route
handlers in a type-safe manner by leveraging
[io-ts](https://github.com/gcanti/io-ts) and some TypeScript inference
magic.

The Problem
-----------

When you see an `any`, you cannot really be sure anymore. When
building web backends, there are quite a few `any`s involved:

- You get a request in. Captured route params, query params from the
  URL and request body are all of an unknown type.

- When generating a response, anything goes for the response body.
  Furthermore, you usually have a fixed set of status codes and each
  of them is associated with a certain type of response body.

By default, the compiler cannot help you with any of this.

The Solution
------------

Use `typera`!

```typescript
import { RouteHandler, Response, routeHandler, routeParams, body } from 'typera'
```

Type your responses:

```typescript
interface User {
  id: number
  name: string
  age: number
}

const listUsers: RouteHandler<Response.Ok<User[]>> = ...
const updateUser: RouteHandler<
  Response.Ok<User> |
  Response.BadRequest<string>
> = ...
```

Use `routeHandler()` to decode and validate incoming data, inferring
the types automatically:

```typescript
import * as t from 'io-ts'
import { IntFromString } from 'io-ts-types/lib/IntFromString'

// io-ts codecs for validating request input
const id = t.type({ id: IntFromString })
const userBody = t.type({ name: t.string, age: t.number })

// Continuing from typed response for updateUser above
const updateUser: RouteHandler<Response.Ok<User> | Response.BadRequest<string>> = 
  routeHandler
    (
      // Validate captured route params with the id codec
      routeParams(id),

      // Validate request body with the userBody codec
      body(userBody)
    )
    (async request => {
      // typera infers the request data types for you:
      //
      // request.routeParams -> { id: number }
      // request.body -> { name: string, age: number }

      const [id, name, agy] = await updateUserInDatabase(
        request.routeParams.id,
        request.body
      )

      // Oops! Age was misspelled as agy. This code won't compile!
      return Response.ok({ id, name, agy })
    })
```

Add the routes:

```typescript
import * as Router from 'koa-router'
import { run } from 'typera'

const router = new Router()

// Transform the typera route handlers back to normal koa-router route
// handlers using run()
router
  .get('/', run(listUsers))
  .put('/:id', run(updateUser))
```

TODO
----

- Support Express in addition to Koa
- Reference docs
- Run tests in CI
