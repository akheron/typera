import { Response, RouteHandler, routeHandler } from 'typera-koa'

export const handler: RouteHandler<Response.Ok<string>> = routeHandler()(
  _req => {
    return Response.badRequest('foo')
  }
)

// Expected error:
// Type 'RouteHandler<KoaRequestBase, Response<400, string, undefined>>' is not assignable to type 'RouteHandler<KoaRequestBase, Response<200, string, undefined>>'.
