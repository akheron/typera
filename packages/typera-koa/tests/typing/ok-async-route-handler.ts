import * as typera from '../../src'

export const handler: typera.RouteHandler<
  typera.Response.Ok<string>
> = typera.routeHandler()(async _req => {
  return typera.Response.ok('foo')
})
