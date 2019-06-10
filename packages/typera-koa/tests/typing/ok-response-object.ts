import * as typera from '../../src'

export const handler: typera.RouteHandler<
  typera.Response.Ok<number>
> = typera.routeHandler()(_req => {
  return { status: 200, body: 42 }
})
