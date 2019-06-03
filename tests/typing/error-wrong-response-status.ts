import * as typera from '../../src'

export const handler: typera.RouteHandler<
  typera.Response.Ok<string>
> = typera.routeHandler()(_req => {
  return typera.Response.badRequest('foo')
})
