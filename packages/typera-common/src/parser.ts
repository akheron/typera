import * as Either from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'

import * as t from 'io-ts'
import { PathReporter } from 'io-ts/lib/PathReporter'

import * as Middleware from './middleware'
import * as Response from './response'

export const bodyP = <RequestBase>(getBody: GetInput<RequestBase>) =>
  genericP(getBody, 'body')

export const body = <RequestBase>(getBody: GetInput<RequestBase>) =>
  generic(getBody, 'body')

export const queryP = <RequestBase>(getQuery: GetInput<RequestBase>) =>
  genericP(getQuery, 'query')

export const query = <RequestBase>(getQuery: GetInput<RequestBase>) =>
  generic(getQuery, 'query')

export const headersP = <RequestBase>(
  getHeaders: GetInput<RequestBase>,
  cloneResult: boolean
) => genericP(getHeaders, 'headers', cloneResult)

export const headers = <RequestBase>(
  getHeaders: GetInput<RequestBase>,
  cloneResult: boolean
) => generic(getHeaders, 'headers', cloneResult)

export const cookiesP = <RequestBase>(getCookies: GetInput<RequestBase>) =>
  genericP(getCookies, 'cookies')

export const cookies = <RequestBase>(getCookies: GetInput<RequestBase>) =>
  generic(getCookies, 'cookies')

// Helpers

export type GetInput<RequestBase> = (req: RequestBase) => any

export type ErrorHandler<ErrorResponse extends Response.Generic> = (
  errors: t.Errors
) => ErrorResponse

const genericP =
  <RequestBase, Key extends string>(
    input: (req: RequestBase) => any,
    key: Key,
    cloneResult = false
  ) =>
  <T, ErrorResponse extends Response.Generic>(
    codec: t.Type<T, any, unknown>,
    errorHandler: ErrorHandler<ErrorResponse>
  ): Middleware.Middleware<RequestBase, Record<Key, T>, ErrorResponse> =>
  (req: RequestBase) =>
    pipe(
      codec.decode(input(req)),
      Either.fold<
        t.Errors,
        T,
        Middleware.MiddlewareOutput<Record<Key, T>, ErrorResponse>
      >(
        (errors) => Middleware.stop(errorHandler(errors)),
        (result) =>
          Middleware.next({
            [key]: cloneResult ? { ...result } : result,
          } as any)
      )
    )

const generic =
  <RequestBase, Key extends string>(
    input: (req: RequestBase) => any,
    key: Key,
    cloneResult = false
  ) =>
  <T>(
    codec: t.Type<T, any, unknown>
  ): Middleware.Middleware<
    RequestBase,
    Record<Key, T>,
    Response.BadRequest<string>
  > =>
    genericP(
      input,
      key,
      cloneResult
    )(codec, (err) =>
      Response.badRequest(`Invalid ${key}: ${errorsToString(err)}`)
    )

function errorsToString(err: t.Errors) {
  return PathReporter.report(Either.left(err))
}
