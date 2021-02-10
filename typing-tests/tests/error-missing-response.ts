import * as t from 'io-ts'
import { Parser, Response, Route, route } from 'typera-koa'

export const handler: Route<Response.Ok<string>> = route
  .post('/')
  .use(Parser.body(t.type({ foo: t.number })))
  .handler((_req) => {
    return Response.ok('foo')
  })

// Expected error:
// Type 'Route<Response<400, string, undefined> | Response<200, string, undefined>>' is not assignable to type 'Route<Response<200, string, undefined>>'.
