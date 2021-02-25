import { Response, Route, route } from 'typera-koa'

export const handler: Route<
  Response.Ok<string, { 'Content-Type': 'application/json' }>
> = route.get('/').handler((_req) => {
  return Response.ok('foo')
})

// Expected error:
// Type 'Route<Ok<string, undefined>>' is not assignable to type 'Route<Ok<string, { 'Content-Type': "application/json"; }>>'.
