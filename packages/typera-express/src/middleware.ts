import { ExpressContext } from './context'
import * as commonMiddleware from 'typera-common/middleware'
import * as commonResponse from 'typera-common/response'

export type Middleware<
  Result,
  Response extends commonResponse.Generic
> = commonMiddleware.Middleware<ExpressContext, Result, Response>

export type Generic = commonMiddleware.Middleware<
  ExpressContext,
  any,
  commonResponse.Generic
>

export { next, stop } from 'typera-common/middleware'
