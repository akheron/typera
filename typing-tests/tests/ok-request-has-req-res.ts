import * as typera from 'typera-express'

export const handler: typera.RouteHandler<
  typera.Response.Ok<string>
> = typera.routeHandler()(req => {
  return typera.Response.ok(req.res.headersSent ? req.req.method : 'foo')
})
