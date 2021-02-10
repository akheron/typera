import { route } from 'typera-koa'

// eslint-disable-next-line @typescript-eslint/no-empty-function
route.get('/').handler((_req) => {})

// Expected error:
// Type 'void' is not assignable to type 'Response<number, any, OptionalHeaders> | Promise<Response<number, any, OptionalHeaders>>
