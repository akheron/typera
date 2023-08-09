import * as commonMiddleware from 'typera-common/middleware'
import * as commonResponse from 'typera-common/response'
import { RequestBase } from './context'

export type Middleware<
  Result,
  Response extends commonResponse.Generic,
> = commonMiddleware.Middleware<RequestBase, Result, Response>

export type ChainedMiddleware<
  Request,
  Result,
  Response extends commonResponse.Generic,
> = commonMiddleware.Middleware<RequestBase & Request, Result, Response>

export type Generic = commonMiddleware.Middleware<
  RequestBase,
  any,
  commonResponse.Generic
>

export { next, stop } from 'typera-common/middleware'
