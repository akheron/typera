import { Parser, Response, RouteHandler, routeHandler } from 'typera-koa'

export const handler: RouteHandler<Response.Ok<string>> = routeHandler(
  Parser.body(t.type({ foo: t.number }))
)(_req => {
  return Response.ok('foo')
})

// Expected error:
// Type 'RouteHandler<Context, Response<400, string, undefined> | Response<200, string, undefined>>' is not assignable to type 'RouteHandler<Context, Response<200, string, undefined>>'.
