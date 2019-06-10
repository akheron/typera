import { Either } from 'fp-ts/lib/Either'
import * as t from 'io-ts'
import * as koa from 'koa'

import Response from './response'

// Request parsers validate the input (route params, query params, request body)
namespace Parser {
  export type Parser<
    Output extends {},
    ErrorResponse extends Response.Generic
  > = (ctx: koa.Context) => Either<ErrorResponse, Output>

  export type ErrorHandler<ErrorResponse extends Response.Generic> = (
    errors: t.Errors
  ) => ErrorResponse

  export function bodyP<
    Codec extends t.Type<any>,
    ErrorResponse extends Response.Generic
  >(
    codec: Codec,
    errorHandler: ErrorHandler<ErrorResponse>
  ): Parser<ParserOutput<'body', Codec>, ErrorResponse> {
    return (ctx: koa.Context) => {
      return codec
        .decode(ctx.request.body)
        .bimap(errorHandler, body => ({ body } as ParserOutput<'body', Codec>))
    }
  }

  export function body<Codec extends t.Type<any>>(
    codec: Codec
  ): Parser<ParserOutput<'body', Codec>, Response.BadRequest<string>> {
    return bodyP(codec, _ => Response.badRequest('invalid body'))
  }

  export function routeParamsP<
    Codec extends t.Type<any>,
    ErrorResponse extends Response.Generic
  >(
    codec: Codec,
    errorHandler: ErrorHandler<ErrorResponse>
  ): Parser<ParserOutput<'routeParams', Codec>, ErrorResponse> {
    return (ctx: koa.Context) =>
      codec
        .decode(ctx.params)
        .bimap(
          errorHandler,
          routeParams => ({ routeParams } as ParserOutput<'routeParams', Codec>)
        )
  }

  export function routeParams<Codec extends t.Type<any>>(
    codec: Codec
  ): Parser<ParserOutput<'routeParams', Codec>, Response.NotFound> {
    return routeParamsP(codec, _ => Response.notFound(undefined))
  }

  export function queryP<
    Codec extends t.Type<any>,
    ErrorResponse extends Response.Generic
  >(
    codec: Codec,
    errorHandler: ErrorHandler<ErrorResponse>
  ): Parser<ParserOutput<'query', Codec>, ErrorResponse> {
    return (ctx: koa.Context) =>
      codec
        .decode(ctx.request.query)
        .bimap(
          errorHandler,
          query => ({ query } as ParserOutput<'query', Codec>)
        )
  }

  export function query<Codec extends t.Type<any>>(
    codec: Codec
  ): Parser<ParserOutput<'query', Codec>, Response.BadRequest<string>> {
    return queryP(codec, _ => Response.badRequest('Invalid query'))
  }
}

// Helper
type ParserOutput<
  K extends string,
  Codec extends t.Type<any>
> = Codec extends t.Type<infer T> ? { [KK in K]: T } : never

export default Parser
