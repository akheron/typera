import { routeHandler } from 'typera-koa'

routeHandler()(_req => {})

// Expected error:
// Type 'void' is not assignable to type 'Response<number, any, OptionalHeaders> | Promise<Response<number, any, OptionalHeaders>>
