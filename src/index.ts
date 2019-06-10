import { either, right } from 'fp-ts/lib/Either'
import { foldM } from 'fp-ts/lib/Foldable2v'
import { array } from 'fp-ts/lib/Array'
import { identity } from 'fp-ts/lib/function'
import * as koa from 'koa'
import 'koa-bodyparser' // Adds `.body` and `.rawBody` to ctx.request

import Parser from './parser'
import Response from './response'

export { Parser, Response }

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
