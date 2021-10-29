# Tutorial

Install typera with yarn or npm.

For [Express]:

```shell
yarn add typera-express
# or
npm install typera-express
```

For [Koa]:

```shell
yarn add typera-koa
# or
npm install typera-koa
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
  .put('/user/:id(int)') // Capture id from the path
  .use(Parser.body(userBody)) // Use the userBody decoder for the request body
  .handler(async (request) => {
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

We first import the stuff that is needed, and define an object type that is
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
  .put('/user/:id(int)') // Capture id from the path
  .use(Parser.body(userBody)) // Use the userBody decoder for the request body
  .handler(async (request) => {
    /* ... */
  })
```

Here we tell that our route is going to handle `PUT` requests. The argument of
`route.put()` is the path pattern. Parts of the path can be captured, like
`:id(int)` above (more on that later).

The `.use()` method adds a middleware to the route. The `userBody` [io-ts] codec
was defined above, and passing it to the `Parser.body()` middleware instructs
typera to parse the incoming request body with that codec.

The `.handler()` method adds the actual route logic, and here is where the magic
happens. The function passed to `.handler()` gets as an argument the `request`
object, that will contain all path captures as well as all the results of the
middleware you passed. And what's great is that the data is correctly typed!

In our example, `request` will have the following inferred type:

```typescript
interface MyRequest {
  routeParams: {
    // These are the path captures, `:id(int)` in this case
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
  .handler(async (request) => {
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

[express]: https://expressjs.com/
[io-ts]: https://github.com/gcanti/io-ts
[koa]: https://koajs.com/
