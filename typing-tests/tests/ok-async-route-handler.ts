import * as typera from 'typera-koa'

export const handler: typera.RouteHandler<
  typera.Response.Ok<string>
> = typera.routeHandler()(async _req => {
  return typera.Response.ok('foo')
})
