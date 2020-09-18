import * as typera from 'typera-koa'

declare const mw1: typera.Middleware.Middleware<{ foo: number }, never>
declare const mw2: typera.Middleware.ChainedMiddleware<{ bar: number }, {baz: number}, never>

export const handler: typera.Route<typera.Response.Ok<
  number
>> = typera.route.get('/foo').use(mw1).use(mw2).handler(_req => {
  return typera.Response.ok(42)
})

// Expected error:
// Type 'Response<number, any, OptionalHeaders> | Response<200, number, undefined>' is not assignable to type 'Response<200, number, undefined>'.
