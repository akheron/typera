import * as t from 'io-ts'
import * as Koa from 'koa'
import 'koa-bodyparser' // Adds `.body` and `.rawBody` to ctx.request

import { Response } from './response'
export { Response } from './response'

// Basic request and response types

export interface Request<RequestParams, RequestQuery, RequestBody> {
  params: RequestParams
  query: RequestQuery
  body: RequestBody
  ctx: Koa.Context
}

// A request handler takes a request and produces a response

export type RequestHandler<
  RequestParams,
  RequestQuery,
  RequestBody,
  Response
> = (
  request: Request<RequestParams, RequestQuery, RequestBody>
) => Response | Promise<Response>

// Codecs validate the input (path params, query params, request body)

interface RequestCodecs {
  params?: t.Type<any, any, any>
  query?: t.Type<any, any, any>
  body?: t.Type<any, any, any>
}

type CodecType<
  K extends keyof RequestCodecs,
  Codecs extends RequestCodecs
> = Codecs[K] extends t.Type<infer T, any, any> ? T : undefined

// Create a route handler from a function that takes a request and
// returns a response

export type RouteHandler<Response extends Response.Generic> = (
  ctx: Koa.Context
) => Promise<Response>

export const routeHandler = <
  Codecs extends RequestCodecs,
  Response extends Response.Generic
>(
  codecs: Codecs,
  handler: RequestHandler<
    CodecType<'params', Codecs>,
    CodecType<'query', Codecs>,
    CodecType<'body', Codecs>,
    Response
  >
): RouteHandler<Response> => async (ctx: Koa.Context): Promise<Response> => {
  const params = codecs.params
    ? codecs.params.decode(ctx.params).getOrElseL(() => ctx.throw(404))
    : undefined
  const query = codecs.query
    ? codecs.query
        .decode(ctx.request.query)
        .getOrElseL(() => ctx.throw(400, 'Invalid query'))
    : undefined
  const body = codecs.body
    ? codecs.body
        .decode(ctx.request.body)
        .getOrElseL(() => ctx.throw(400, 'Invalid body'))
    : undefined

  const request = {
    params,
    query,
    body,
    ctx,
  }
  return handler(request)
}

// Turn a route handler to a koa-router's route callback

export const run = <Response extends Response.Generic>(
  handler: RouteHandler<Response>
) => async (ctx: Koa.Context): Promise<void> => {
  const response = await handler(ctx)
  ctx.response.status = response.status
  ctx.response.body = response.body
}
