import * as typera from 'typera-express'

export const handler: typera.Route<
  typera.Response.Ok<string>
> = typera.route.get('/').handler((req) => {
  return typera.Response.ok(req.res.headersSent ? req.req.method : 'foo')
})
