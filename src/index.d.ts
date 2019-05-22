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

// Basic request and response types

export interface Request<RequestRouteParams, RequestQuery, RequestBody> {
  routeParams: RequestRouteParams
  query: RequestQuery
  body: RequestBody
  ctx: koa.Context
}

// A request handler takes a request and produces a response

export type RequestHandler<
  RequestRouteParams,
  RequestQuery,
  RequestBody,
  Response
> = (
  request: Request<RequestRouteParams, RequestQuery, RequestBody>
) => Response | Promise<Response>

// Codecs validate the input (route params, query params, request body)

interface RequestCodecs {
  routeParams?: t.Type<any, any, any>
  query?: t.Type<any, any, any>
  body?: t.Type<any, any, any>
}

type CodecType<
  K extends keyof RequestCodecs,
  Codecs extends RequestCodecs
> = Codecs[K] extends t.Type<infer T, any, any> ? T : undefined

declare function body<Codec extends t.Type<any, any, any>>(
  codec: Codec
): ['body', Codec]

declare function routeParams<Codec extends t.Type<any, any, any>>(
  codec: Codec
): ['routeParams', Codec]

declare function query<Codec extends t.Type<any, any, any>>(
  codec: Codec
): ['query', Codec]

// Create a route handler from a function that takes a request and
// returns a response

type CodecName = keyof RequestCodecs
type SetCodec<
  K extends keyof RequestCodecs,
  T,
  Codecs extends RequestCodecs
> = Codecs & Record<K, t.Type<T, any, any>>

type CodecTuple<T extends t.Type<T, any, any>> = [CodecName, T]

type RequestCodecsFromTuples<Args extends CodecTuple<any>[]> = {
  0: Head<Args> extends [infer K, t.Type<infer T, any, any>]
    ? RequestCodecsFromTuples<Tail<Args>> extends infer U
      ? SetCodec<Cast<K, CodecName>, T, U>
      : never
    : never
  1: {}
}[Length<Args> extends 0 ? 1 : 0]

type RouteHandler<Response extends Response.Generic> = (
  ctx: koa.Context
) => Promise<Response>

declare function routeHandler<Args extends CodecTuple<any>[]>(
  ...args: Args
): RequestCodecsFromTuples<Args> extends infer Codecs
  ? <Response extends Response.Generic>(
      handler: RequestHandler<
        CodecType<'routeParams', Codecs>,
        CodecType<'query', Codecs>,
        CodecType<'body', Codecs>,
        Response
      >
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
