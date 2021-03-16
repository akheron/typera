import * as typera from 'typera-koa'

declare const mw1: typera.Middleware.Middleware<{ foo: number }, never>
declare const mw2: typera.Middleware.ChainedMiddleware<
  { bar: number },
  { baz: number },
  never
>

export const handler = typera.route
  .get('/foo')
  .use(mw1)
  .use(mw2)
  .handler((_req) => {
    return typera.Response.ok(42)
  })

// Expected error:
// Argument of type 'ChainedMiddleware<{ bar: number; }, { baz: number; }, never>' is not assignable to parameter of type 'Generic<RequestBase & { routeParams: {}; } & { foo: number; }>'.
