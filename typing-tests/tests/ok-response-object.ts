import * as typera from 'typera-koa'

export const handler: typera.Route<typera.Response.Ok<number>> = typera.route
  .get('/')
  .handler((_req) => {
    return { status: 200, body: 42, headers: undefined }
  })
