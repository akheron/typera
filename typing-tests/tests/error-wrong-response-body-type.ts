import { Response, Route, route } from 'typera-koa'

export const handler: Route<Response.Ok<string>> = route
  .get('/')
  .handler((_req) => {
    return Response.ok(123)
  })

// Expected error:
// Type 'Route<Ok<number, undefined>>' is not assignable to type 'Route<Ok<string, undefined>>'.
