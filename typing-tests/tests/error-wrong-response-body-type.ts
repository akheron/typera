import { Response, RouteHandler, routeHandler } from 'typera-koa'

export const handler: RouteHandler<Response.Ok<string>> = routeHandler()(
  _req => {
    return Response.ok(123)
  }
)

// Expected error:
// Type 'RouteHandler<RequestBase, Response<200, number, undefined>>' is not assignable to type 'RouteHandler<RequestBase, Response<200, string, undefined>>'.
