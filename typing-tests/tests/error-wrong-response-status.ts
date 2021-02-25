import { Response, Route, route } from 'typera-koa'

export const handler: Route<Response.Ok<string>> = route
  .get('/')
  .handler((_req) => {
    return Response.badRequest('foo')
  })

// Expected error:
// Type 'Route<BadRequest<string, undefined>>' is not assignable to type 'Route<Ok<string, undefined>>'.
