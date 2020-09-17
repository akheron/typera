import { Response, RouteHandler, routeHandler } from 'typera-koa'

export const handler: RouteHandler<Response.Ok<
  string,
  { 'Content-Type': 'application/json' }
>> = routeHandler()(_req => {
  return Response.ok('foo')
})

// Expected error:
// Type 'RouteHandler<KoaRequestBase, Response<200, string, undefined>>' is not assignable to type 'RouteHandler<KoaRequestBase, Response<200, string, { 'Content-Type': "application/json"; }>>'.
