import { Response, Route, route } from 'typera-koa'

export const handler: Route<
  Response.Ok<string, { 'Content-Type': 'application/json' }>
> = route.get('/').handler(_req => {
  return Response.ok('foo')
})

// Expected error:
// Type 'Route<Response<200, string, undefined>>' is not assignable to type 'Route<Response<200, string, { 'Content-Type': "application/json"; }>>'.
