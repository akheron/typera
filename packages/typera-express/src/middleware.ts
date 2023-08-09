import * as express from 'express'
import { RequestBase } from './context'
import * as commonMiddleware from 'typera-common/middleware'
import * as commonResponse from 'typera-common/response'

export { next, stop } from 'typera-common/middleware'

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

export const wrapNative =
  <Result = unknown>(
    middleware: express.Handler,
    result?: (request: RequestBase) => Result
  ): Middleware<Result, never> =>
  (request) =>
    new Promise((resolve, reject) => {
      const { req, res } = request
      let resolved = false

      const next = (err?: unknown) => {
        resolved = true
        if (err) {
          // middleware called next(err)
          reject(err)
        } else {
          // middleware called next()
          const makeResult = result ?? (() => ({}) as Result)
          resolve(commonMiddleware.next(makeResult(request)))
        }
      }

      const originalEnd = res.end
      res.end = (...args: any): void => {
        if (!resolved) {
          resolved = true
          // Abuse streamingBody to call an arbitrary res method
          resolve(
            commonMiddleware.stop({
              status: res.statusCode,
              body: commonResponse.streamingBody(() => {
                originalEnd.apply(res, args)
              }),
            } as never)
          )
        } else {
          originalEnd.apply(res, args)
        }
      }

      middleware(req, res, next)
    })
