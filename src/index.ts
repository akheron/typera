import { Either, either, right } from 'fp-ts/lib/Either'
import { foldM } from 'fp-ts/lib/Foldable2v'
import { array } from 'fp-ts/lib/Array'
import { identity } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import * as koa from 'koa'
import 'koa-bodyparser' // Adds `.body` and `.rawBody` to ctx.request

// Request parsers validate the input (route params, query params, request body)
export namespace Parser {
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

  // Helper
  type ParserOutput<
    K extends string,
    Codec extends t.Type<any>
  > = Codec extends t.Type<infer T> ? { [KK in K]: T } : never
}

export namespace Response {
  export type Response<Status, Body> = {
    status: Status
    body: Body
  }

  export type Generic = Response<number, any>
  export type Ok<Body = undefined> = Response<200, Body>
  export type Created<Body = undefined> = Response<201, Body>
  export type NoContent = Response<204, undefined>
  export type BadRequest<Body = undefined> = Response<400, Body>
  export type NotFound<Body = undefined> = Response<404, Body>

  export function ok<Body>(body: Body): Ok<Body>
  export function ok(): Ok
  export function ok(body = undefined) {
    return { status: 200, body }
  }

  export function created<Body>(body: Body): Created<Body>
  export function created<Body>(): Created
  export function created(body = undefined) {
    return { status: 201, body }
  }

  export function noContent(): NoContent {
    return { status: 204, body: undefined }
  }

  export function badRequest<Body>(body: Body): BadRequest<Body>
  export function badRequest<Body>(): BadRequest
  export function badRequest(body = undefined) {
    return { status: 400, body }
  }

  export function notFound<Body>(body: Body): NotFound<Body>
  export function notFound(): NotFound
  export function notFound(body = undefined) {
    return { status: 404, body }
  }
}

// A request handler takes a request and produces a response

export type RequestHandler<Request, Response> = (
  request: Request
) => Response | Promise<Response>

// Create a route handler from request parsers and a function that
// takes a request and returns a response

export type RouteHandler<Response extends Response.Generic> = (
  ctx: koa.Context
) => Promise<Response>

export function routeHandler<Parsers extends Parser.Parser<any, any>[]>(
  ...parsers: Parsers
): MakeRouteHandler<Parsers> {
  const parseRequest = (ctx: koa.Context) =>
    foldM(either, array)(parsers, right({ ctx }), (acc, parser) =>
      parser(ctx).map(v => ({ ...acc, ...v }))
    )

  return <any>((handler: any) => (ctx: koa.Context) =>
    parseRequest(ctx)
      .map(handler)
      .getOrElseL(identity))
}

// Turn a route handler to a koa-router's route callback

export function run<Response extends Response.Generic>(
  handler: RouteHandler<Response>
): (ctx: koa.Context) => Promise<void> {
  return async ctx => {
    const response = await handler(ctx)
    ctx.response.status = response.status
    ctx.response.body = response.body
  }
}

// Helpers

type MakeRouteHandler<
  Parsers extends Parser.Parser<any, any>[]
> = TypesFromParsers<Parsers> extends ParserType<
  infer Request,
  infer ParserResponses
>
  ? <Response extends Response.Generic>(
      handler: RequestHandler<Request, Response>
    ) => RouteHandler<Response | ParserResponses>
  : never

interface ParserType<
  Request extends {},
  ParserResponse extends Response.Generic
> {
  _req: Request
  _err: ParserResponse
}

type TypesFromParsers<Parsers extends Parser.Parser<any, any>[]> = {
  0: Head<Parsers> extends Parser.Parser<infer R, infer E>
    ? TypesFromParsers<Tail<Parsers>> extends ParserType<infer RR, infer EE>
      ? ParserType<R & RR, E | EE>
      : never
    : never
  1: ParserType<{ ctx: koa.Context }, never>
}[Length<Parsers> extends 0 ? 1 : 0]

type Length<T extends any[]> = T['length']
type Head<T extends any[]> = T extends [infer U, ...any[]] ? U : never
type Tail<T extends any[]> = ((...args: T) => any) extends ((
  _: any,
  ...rest: infer U
) => any)
  ? U
  : never
