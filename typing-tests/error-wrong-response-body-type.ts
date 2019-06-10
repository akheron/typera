import { Response, RouteHandler, routeHandler } from 'typera-koa'

export const handler: RouteHandler<Response.Ok<string>> = routeHandler()(
  _req => {
    return Response.ok(123)
  }
)
