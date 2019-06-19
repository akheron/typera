import * as koa from 'koa'
import 'koa-bodyparser' // Adds `body` to ctx.request

import * as common from 'typera-common'
export { Response, RequestHandler } from 'typera-common'

export namespace Parser {
  export type Parser<
    Output extends {},
    ErrorResponse extends common.Response.Generic
  > = common.Parser.Parser<koa.Context, Output, ErrorResponse>

  export type ErrorHandler<
    ErrorResponse extends common.Response.Generic
  > = common.Parser.ErrorHandler<ErrorResponse>

  function getBody(ctx: koa.Context): any {
    return ctx.request.body
  }
  export const bodyP = common.Parser.bodyP(getBody)
  export const body = common.Parser.body(getBody)

  function getRouteParams(ctx: koa.Context): any {
    return ctx.params
  }
  export const routeParamsP = common.Parser.routeParamsP(getRouteParams)
  export const routeParams = common.Parser.routeParams(getRouteParams)

  function getQuery(ctx: koa.Context): any {
    return ctx.request.query
  }
  export const queryP = common.Parser.queryP(getQuery)
  export const query = common.Parser.query(getQuery)

  function getHeaders(ctx: koa.Context): any {
    return ctx.request.headers
  }
  export const headersP = common.Parser.headersP(getHeaders)
  export const headers = common.Parser.headers(getHeaders)
}

export type RouteHandler<
  Response extends common.Response.Generic
> = common.RouteHandler<koa.Context, Response>

interface KoaRequestBase {
  ctx: koa.Context
}

function makeRequestBase(ctx: koa.Context): KoaRequestBase {
  return { ctx }
}

export function routeHandler<
  Parsers extends common.Parser.Parser<koa.Context, any, any>[]
>(
  ...parsers: Parsers
): common.MakeRouteHandler<koa.Context, KoaRequestBase, Parsers> {
  return common.routeHandler(makeRequestBase, parsers)
}

export function run<Response extends common.Response.Generic>(
  handler: RouteHandler<Response>
): (ctx: koa.Context) => Promise<void> {
  return async ctx => {
    const response = await handler(ctx)
    ctx.response.status = response.status
    if (response.headers != null) {
      ctx.response.set(response.headers)
    }
    ctx.response.body = response.body
  }
}
