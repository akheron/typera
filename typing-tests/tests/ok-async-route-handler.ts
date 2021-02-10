import * as typera from 'typera-koa'

export const root: typera.Route<typera.Response.Ok<string>> = typera.route
  .get('/')
  .handler(async (_req) => {
    return typera.Response.ok('foo')
  })
