import * as t from 'io-ts'
import * as koa from 'koa'
import 'koa-bodyparser' // Adds `.body` and `.rawBody` to ctx.request

export namespace Response {
  export type Response<ResponseStatus, ResponseBody> = {
    status: ResponseStatus
    body: ResponseBody
  }

  export type Generic = Response<number, any>
  export type Ok<ResponseBody = undefined> = Response<200, ResponseBody>
  export type Created<ResponseBody = undefined> = Response<201, ResponseBody>
  export type NoContent = Response<204, undefined>
  export type BadRequest<ResponseBody = undefined> = Response<400, ResponseBody>
  export type NotFound<ResponseBody = undefined> = Response<404, ResponseBody>

  export function ok<ResponseBody>(body: ResponseBody): Ok<ResponseBody> {
    return { status: 200, body }
  }

  export function created<ResponseBody>(
    body: ResponseBody
  ): Created<ResponseBody> {
    return { status: 201, body }
  }

  export function noContent(): NoContent {
    return { status: 204, body: undefined }
  }

  export function badRequest<ResponseBody>(
    body: ResponseBody
  ): BadRequest<ResponseBody> {
    return { status: 400, body }
  }

  export function notFound<ResponseBody>(
    body: ResponseBody
  ): NotFound<ResponseBody> {
    return { status: 404, body }
  }
}

// A request handler takes a request and produces a response

export type RequestHandler<Request, Response> = (
  request: Request
) => Response | Promise<Response>

// Request parsers validate the input (route params, query params, request body)

type ParserOutput<
  K extends string,
  Codec extends t.Type<any>
> = Codec extends t.Type<infer T> ? { [KK in K]: T } : never

type RequestParser<K extends string, Codec extends t.Type<any>> = (
  ctx: koa.Context
) => ParserOutput<K, Codec>

export function body<Codec extends t.Type<any>>(
  codec: Codec
): RequestParser<'body', Codec> {
  type Output = ParserOutput<'body', Codec>
  return function(ctx: koa.Context): Output {
    return codec
      .decode(ctx.request.body)
      .map(body => ({ body } as Output))
      .getOrElseL(() => ctx.throw(400, 'Invalid body'))
  }
}

export function routeParams<Codec extends t.Type<any>>(
  codec: Codec
): RequestParser<'routeParams', Codec> {
  type Output = ParserOutput<'routeParams', Codec>
  return (ctx: koa.Context) =>
    codec
      .decode(ctx.params)
      .map(routeParams => ({ routeParams } as Output))
      .getOrElseL(() => ctx.throw(404))
}

export function query<Codec extends t.Type<any>>(
  codec: Codec
): RequestParser<'query', Codec> {
  type Output = ParserOutput<'query', Codec>
  return (ctx: koa.Context) =>
    codec
      .decode(ctx.request.query)
      .map(query => ({ query } as Output))
      .getOrElseL(() => ctx.throw(400, 'Invalid query'))
}

// Create a route handler from request parsers and a function that
// takes a request and returns a response

export type RouteHandler<Response extends Response.Generic> = (
  ctx: koa.Context
) => Promise<Response>

export function routeHandler<Parsers extends RequestParser<any, any>[]>(
  ...parsers: Parsers
): MakeRouteHandler<Parsers> {
  const parseRequest = (ctx: koa.Context) => ({
    ...parsers.reduce((acc, parser) => ({ ...acc, ...parser(ctx) }), {}),
    ctx,
  })
  return <any>(
    ((handler: any) => (ctx: koa.Context) => handler(parseRequest(ctx)))
  )
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

type RequestFromParsers<Args extends RequestParser<any, any>[]> = {
  0: ReturnType<Cast<Head<Args>, RequestParser<any, any>>> extends infer T
    ? RequestFromParsers<Tail<Args>> extends infer U
      ? T & U
      : never
    : never
  1: { ctx: koa.Context }
}[Length<Args> extends 0 ? 1 : 0]

type MakeRouteHandler<
  Args extends RequestParser<any, any>[]
> = RequestFromParsers<Args> extends infer Req
  ? <Response extends Response.Generic>(
      handler: RequestHandler<Req, Response>
    ) => RouteHandler<Response>
  : never

type Cast<T, U> = T extends U ? T : U
type Length<T extends any[]> = T['length']
type Head<T extends any[]> = T extends [infer U, ...any[]] ? U : never
type Tail<T extends any[]> = ((...args: T) => any) extends ((
  _: any,
  ...rest: infer U
) => any)
  ? U
  : never
