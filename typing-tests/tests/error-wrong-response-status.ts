import { Response, RouteHandler, routeHandler } from 'typera-koa'

export const handler: RouteHandler<Response.Ok<string>> = routeHandler()(
  _req => {
    return Response.badRequest('foo')
  }
)

// Expected error:
// Type 'RouteHandler<Context, Response<400, string, undefined>>' is not assignable to type 'RouteHandler<Context, Response<200, string, undefined>>'.
