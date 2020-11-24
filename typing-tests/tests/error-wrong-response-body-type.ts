import { Response, Route, route } from 'typera-koa'

export const handler: Route<Response.Ok<string>> = route
  .get('/')
  .handler(_req => {
    return Response.ok(123)
  })

// Expected error:
// Type 'Route<Response<200, number, undefined>>' is not assignable to type 'Route<Response<200, string, undefined>>'.
