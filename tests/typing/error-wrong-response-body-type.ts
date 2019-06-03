import * as typera from '../../lib'

export const handler: typera.RouteHandler<
  typera.Response.Ok<string>
> = typera.routeHandler()(_req => {
  return typera.Response.ok(123)
})
