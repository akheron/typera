import * as express from 'express'
import { RequestBase } from './context'
import * as commonMiddleware from 'typera-common/middleware'
import * as commonResponse from 'typera-common/response'

export { next, stop } from 'typera-common/middleware'

export type Middleware<
  Result,
  Response extends commonResponse.Generic
> = commonMiddleware.Middleware<RequestBase, Result, Response>

export type ChainedMiddleware<
  Request,
  Result,
  Response extends commonResponse.Generic
> = commonMiddleware.Middleware<RequestBase & Request, Result, Response>

export type Generic = commonMiddleware.Middleware<
  RequestBase,
  any,
  commonResponse.Generic
>

interface NativeOptions<Request, Result> {
  timeout?: number | null
  result?: (request: Request) => Result
}

export const wrapNative = <Request = RequestBase, Result = unknown>(
  middleware: express.Handler,
  options?: NativeOptions<Request, Result>
): ChainedMiddleware<Request, Result, never> => (request) =>
  new Promise((resolve, reject) => {
    const { timeout = 100, result = () => ({} as Result) } = options ?? {}
    const { req, res } = request
    let timeoutHandle: NodeJS.Timeout | undefined

    const next = (err?: unknown) => {
      if (timeoutHandle) clearTimeout(timeoutHandle)
      restoreRes()

      if (err) {
        // middleware called next(err)
        reject(err)
      } else {
        // middleware called next()
        resolve(commonMiddleware.next(result(request)))
      }
    }

    const end: EndHandler = (status, method, args) => {
      // middleware sent the response

      if (timeoutHandle) clearTimeout(timeoutHandle)
      restoreRes()

      // Abuse streamingBody to call an arbitrary res method
      resolve(
        commonMiddleware.stop({
          status,
          body: commonResponse.streamingBody(() => {
            const resAny = res as any
            resAny[method](...args)
          }),
        } as never)
      )
    }

    const timedOut = () => {
      restoreRes()
      reject(new Error('middleware timed out'))
    }

    if (timeout !== null) {
      timeoutHandle = setTimeout(timedOut, timeout)
    }

    const restoreRes = setupResponseMock(res, end)
    middleware(req, res, next)
  })

type EndHandler = (
  status: number,
  method: 'end' | 'send' | 'sendFile',
  args: any[]
) => void

const setupResponseMock = (
  res: express.Response,
  onEnd: EndHandler
): (() => void) => {
  // These methods are the ones that express uses internally to send a
  // response. Others are available, but they all just call these three.
  const end = (...args: any[]): void => {
    onEnd(res.statusCode, 'end', args)
  }
  const send = (body?: any): express.Response => {
    onEnd(res.statusCode, 'send', [body])
    return res
  }
  const sendFile = (...args: any[]): void => {
    onEnd(res.statusCode, 'sendFile', args)
  }

  const originals = { end: res.end, send: res.send, sendFile: res.sendFile }
  Object.assign(res, { end, send, sendFile })

  return () => {
    Object.assign(res, originals)
  }
}
