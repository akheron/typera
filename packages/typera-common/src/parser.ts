import * as Either from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'

import * as t from 'io-ts'
import { PathReporter } from 'io-ts/lib/PathReporter'

import * as Middleware from './middleware'
import * as Response from './response'

// Request parsers validate the input (route params, query params,
// request body) using io-ts

export type ErrorHandler<ErrorResponse extends Response.Generic> = (
  errors: t.Errors
) => ErrorResponse

export function bodyP<RequestBase>(getBody: (req: RequestBase) => any) {
  return function <T, ErrorResponse extends Response.Generic>(
    codec: t.Type<T, any, unknown>,
    errorHandler: ErrorHandler<ErrorResponse>
  ): Middleware.Middleware<RequestBase, { body: T }, ErrorResponse> {
    return (req: RequestBase) =>
      pipe(
        codec.decode(getBody(req)),
        Either.map<any, any>(body => ({ value: { body } })),
        Either.getOrElse((errors: t.Errors) => ({
          response: errorHandler(errors),
        }))
      )
  }
}

export function body<RequestBase>(getBody: (req: RequestBase) => any) {
  return <T>(
    codec: t.Type<T, any, unknown>
  ): Middleware.Middleware<
    RequestBase,
    { body: T },
    Response.BadRequest<string>
  > => {
    return bodyP(getBody)(codec, err =>
      Response.badRequest(`Invalid body: ${errorsToString(err)}`)
    )
  }
}

export function routeParamsP<RequestBase>(
  getRouteParams: (req: RequestBase) => any
) {
  return function <T, ErrorResponse extends Response.Generic>(
    codec: t.Type<T, any, unknown>,
    errorHandler: ErrorHandler<ErrorResponse>
  ): Middleware.Middleware<RequestBase, { routeParams: T }, ErrorResponse> {
    return function (req: RequestBase) {
      return pipe(
        codec.decode(getRouteParams(req)),
        Either.map<any, any>(routeParams => ({ value: { routeParams } })),
        Either.getOrElse((errors: t.Errors) => ({
          response: errorHandler(errors),
        }))
      )
    }
  }
}

export function routeParams<RequestBase>(
  getRouteParams: (req: RequestBase) => any
) {
  return <T>(
    codec: t.Type<T, any, unknown>
  ): Middleware.Middleware<
    RequestBase,
    { routeParams: T },
    Response.NotFound
  > => routeParamsP(getRouteParams)(codec, _ => Response.notFound(undefined))
}

export function queryP<RequestBase>(getQuery: (req: RequestBase) => any) {
  return function <T, ErrorResponse extends Response.Generic>(
    codec: t.Type<T, any, unknown>,
    errorHandler: ErrorHandler<ErrorResponse>
  ): Middleware.Middleware<RequestBase, { query: T }, ErrorResponse> {
    return function (req: RequestBase) {
      return pipe(
        codec.decode(getQuery(req)),
        Either.map<any, any>(query => ({ value: { query } })),
        Either.getOrElse((errors: t.Errors) => ({
          response: errorHandler(errors),
        }))
      )
    }
  }
}

export function query<RequestBase>(getQuery: (req: RequestBase) => any) {
  return <T>(
    codec: t.Type<T, any, unknown>
  ): Middleware.Middleware<
    RequestBase,
    { query: T },
    Response.BadRequest<string>
  > =>
    queryP(getQuery)(codec, err =>
      Response.badRequest(`Invalid query: ${errorsToString(err)}`)
    )
}

export function headersP<RequestBase>(getHeaders: (req: RequestBase) => any) {
  return function <T, ErrorResponse extends Response.Generic>(
    codec: t.Type<T, any, unknown>,
    errorHandler: ErrorHandler<ErrorResponse>
  ): Middleware.Middleware<RequestBase, { headers: T }, ErrorResponse> {
    return function (req: RequestBase) {
      return pipe(
        codec.decode(getHeaders(req)),
        Either.map<any, any>(headers => ({ value: { headers } })),
        Either.getOrElse((errors: t.Errors) => ({
          response: errorHandler(errors),
        }))
      )
    }
  }
}

export function headers<RequestBase>(getHeaders: (req: RequestBase) => any) {
  return <T>(
    codec: t.Type<T, any, unknown>
  ): Middleware.Middleware<
    RequestBase,
    { headers: T },
    Response.BadRequest<string>
  > =>
    headersP(getHeaders)(codec, err =>
      Response.badRequest(`Invalid headers: ${errorsToString(err)}`)
    )
}

// Helpers

function errorsToString(err: t.Errors) {
  return PathReporter.report(Either.left(err))
}
