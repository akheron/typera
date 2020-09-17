import * as commonMiddleware from 'typera-common/middleware'
import * as commonResponse from 'typera-common/response'
import { KoaRequestBase } from './context'

export type Middleware<
  Result,
  Response extends commonResponse.Generic
> = commonMiddleware.Middleware<KoaRequestBase, Result, Response>

export type Generic = commonMiddleware.Middleware<
  KoaRequestBase,
  any,
  commonResponse.Generic
>

export { next, stop } from 'typera-common/middleware'
