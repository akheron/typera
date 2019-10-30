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

export function bodyP<Input>(getBody: (input: Input) => any) {
  return function<
    Codec extends t.Type<any>,
    ErrorResponse extends Response.Generic
  >(
    codec: Codec,
    errorHandler: ErrorHandler<ErrorResponse>
  ): Middleware.Middleware<Input, ParserOutput<'body', Codec>, ErrorResponse> {
    return (input: Input) =>
      pipe(
        codec.decode(getBody(input)),
        Either.map<any, any>(body => ({ value: { body } })),
        Either.getOrElse((errors: t.Errors) => ({
          response: errorHandler(errors),
        }))
      )
  }
}

export function body<Input>(getBody: (input: Input) => any) {
  return <Codec extends t.Type<any>>(
    codec: Codec
  ): Middleware.Middleware<
    Input,
    ParserOutput<'body', Codec>,
    Response.BadRequest<string>
  > => {
    return bodyP(getBody)(codec, err =>
      Response.badRequest(`Invalid body: ${errorsToString(err)}`)
    )
  }
}

export function routeParamsP<Input>(getRouteParams: (input: Input) => any) {
  return function<
    Codec extends t.Type<any>,
    ErrorResponse extends Response.Generic
  >(
    codec: Codec,
    errorHandler: ErrorHandler<ErrorResponse>
  ): Middleware.Middleware<
    Input,
    ParserOutput<'routeParams', Codec>,
    ErrorResponse
  > {
    return function(input: Input) {
      return pipe(
        codec.decode(getRouteParams(input)),
        Either.map<any, any>(routeParams => ({ value: { routeParams } })),
        Either.getOrElse((errors: t.Errors) => ({
          response: errorHandler(errors),
        }))
      )
    }
  }
}

export function routeParams<Input>(getRouteParams: (input: Input) => any) {
  return <Codec extends t.Type<any>>(
    codec: Codec
  ): Middleware.Middleware<
    Input,
    ParserOutput<'routeParams', Codec>,
    Response.NotFound
  > => routeParamsP(getRouteParams)(codec, _ => Response.notFound(undefined))
}

export function queryP<Input>(getQuery: (input: Input) => any) {
  return function<
    Codec extends t.Type<any>,
    ErrorResponse extends Response.Generic
  >(
    codec: Codec,
    errorHandler: ErrorHandler<ErrorResponse>
  ): Middleware.Middleware<Input, ParserOutput<'query', Codec>, ErrorResponse> {
    return function(input: Input) {
      return pipe(
        codec.decode(getQuery(input)),
        Either.map<any, any>(query => ({ value: { query } })),
        Either.getOrElse((errors: t.Errors) => ({
          response: errorHandler(errors),
        }))
      )
    }
  }
}

export function query<Input>(getQuery: (input: Input) => any) {
  return <Codec extends t.Type<any>>(
    codec: Codec
  ): Middleware.Middleware<
    Input,
    ParserOutput<'query', Codec>,
    Response.BadRequest<string>
  > =>
    queryP(getQuery)(codec, err =>
      Response.badRequest(`Invalid query: ${errorsToString(err)}`)
    )
}

export function headersP<Input>(getHeaders: (input: Input) => any) {
  return function<
    Codec extends t.Type<any>,
    ErrorResponse extends Response.Generic
  >(
    codec: Codec,
    errorHandler: ErrorHandler<ErrorResponse>
  ): Middleware.Middleware<
    Input,
    ParserOutput<'headers', Codec>,
    ErrorResponse
  > {
    return function(input: Input) {
      return pipe(
        codec.decode(getHeaders(input)),
        Either.map<any, any>(headers => ({ value: { headers } })),
        Either.getOrElse((errors: t.Errors) => ({
          response: errorHandler(errors),
        }))
      )
    }
  }
}

export function headers<Input>(getHeaders: (input: Input) => any) {
  return <Codec extends t.Type<any>>(
    codec: Codec
  ): Middleware.Middleware<
    Input,
    ParserOutput<'headers', Codec>,
    Response.BadRequest<string>
  > =>
    headersP(getHeaders)(codec, err =>
      Response.badRequest(`Invalid headers: ${errorsToString(err)}`)
    )
}

// Helpers

export type ParserOutput<K extends string, Codec extends t.Type<any>> = {
  [KK in K]: t.TypeOf<Codec>
}

function errorsToString(err: t.Errors) {
  return PathReporter.report(Either.left(err))
}
