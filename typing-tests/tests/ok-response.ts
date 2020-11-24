import * as typera from 'typera-koa'

export const handler: typera.Route<
  typera.Response.Ok<number>
> = typera.route.get('/').handler(_req => {
  return typera.Response.ok(42)
})
