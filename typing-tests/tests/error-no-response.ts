import { route } from 'typera-koa'

route.get('/').handler(_req => {})

// Expected error:
// Type 'void' is not assignable to type 'Response<number, any, OptionalHeaders> | Promise<Response<number, any, OptionalHeaders>>
