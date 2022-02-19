import * as t from 'io-ts'
import { Parser, Response, Route, route } from 'typera-koa'

export const handler: Route<Response.Ok<string> | Response.BadRequest<string>> =
  route
    .get('/')
    .use(Parser.headers(t.exact({ foo: t.string })))
    .handler((_req) => {
      return Response.ok('😎')
    })

// Expected error:
// Argument of type 'ExactC<HasProps>' is not assignable to parameter of type 'never'.
