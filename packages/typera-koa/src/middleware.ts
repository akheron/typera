import * as koa from 'koa'
import * as commonMiddleware from 'typera-common/middleware'
import * as commonResponse from 'typera-common/response'

export type Middleware<
  Result extends {},
  Response extends commonResponse.Generic
> = commonMiddleware.Middleware<koa.Context, Result, Response>

export type Generic = commonMiddleware.Middleware<
  koa.Context,
  {},
  commonResponse.Generic
>

export { next, stop } from 'typera-common/middleware'
