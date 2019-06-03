import { Either } from 'fp-ts/lib/Either'
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

  export function ok<ResponseBody>(body: ResponseBody): Ok<ResponseBody>

  export function created<ResponseBody>(
    body: ResponseBody
  ): Created<ResponseBody>

  export function noContent(): NoContent

  export function badRequest<ResponseBody>(
    body: ResponseBody
  ): BadRequest<ResponseBody>

  export function notFound<ResponseBody>(
    body: ResponseBody
  ): NotFound<ResponseBody>
}

// A request handler takes a request and produces a response

export type RequestHandler<Request, Response> = (
  request: Request
) => Response | Promise<Response>

// Request parsers validate the input (route params, query params, request body)

declare function body<Codec extends t.Type<any, any, any>>(
  codec: Codec
): Codec extends t.Type<infer T, any, any>
  ? (ctx: koa.Context) => { body: T }
  : never

declare function routeParams<Codec extends t.Type<any, any, any>>(
  codec: Codec
): Codec extends t.Type<infer T, any, any>
  ? (ctx: koa.Context) => { routeParams: T }
  : never

declare function query<Codec extends t.Type<any, any, any>>(
  codec: Codec
): Codec extends t.Type<infer T, any, any>
  ? (ctx: koa.Context) => { query: T }
  : never

// Create a route handler from a function that takes a request and
// returns a response

type RequestParser = (ctx: koa.Context) => {}

type RequestFromArgs<Args extends RequestParser[]> = {
  0: ReturnType<Cast<Head<Args>, RequestParser>> extends infer T
    ? RequestFromArgs<Tail<Args>> extends infer U
      ? T & U
      : never
    : never
  1: { ctx: koa.Context }
}[Length<Args> extends 0 ? 1 : 0]

type RouteHandler<Response extends Response.Generic> = (
  ctx: koa.Context
) => Promise<Response>

declare function routeHandler<Args extends RequestParser[]>(
  ...args: Args
): RequestFromArgs<Args> extends infer Req
  ? <Response extends Response.Generic>(
      handler: RequestHandler<Req, Response>
    ) => RouteHandler<Response>
  : never

// Turn a route handler to a koa-router's route callback

declare function run<Response extends Response.Generic>(
  handler: RouteHandler<Response>
): (ctx: koa.Context) => Promise<void>

// Helpers

type Cast<T, U> = T extends U ? T : U
type Length<T extends any[]> = T['length']
type Head<T extends any[]> = T extends [infer U, ...any[]] ? U : never
type Tail<T extends any[]> = ((...args: T) => any) extends ((
  _: any,
  ...rest: infer U
) => any)
  ? U
  : never
