import * as koa from 'koa'
import * as koaRouter from 'koa-router'
import 'koa-bodyparser' // Adds `body` to ctx.request

import * as common from 'typera-common'
export { Response, RequestHandler, URL } from 'typera-common'

interface KoaRequestBase {
  ctx: koa.Context
}

function makeRequestBase(ctx: koa.Context): KoaRequestBase {
  return { ctx }
}

function getRouteParams(ctx: koa.Context): any {
  return ctx.params
}

export namespace Middleware {
  export type Middleware<
    Result extends {},
    Response extends common.Response.Generic
  > = common.Middleware.Middleware<koa.Context, Result, Response>

  export type Generic = common.Middleware.Middleware<
    koa.Context,
    {},
    common.Response.Generic
  >

  export const next = common.Middleware.next
  export const stop = common.Middleware.stop
}

export namespace Parser {
  export type ErrorHandler<
    ErrorResponse extends common.Response.Generic
  > = common.Parser.ErrorHandler<ErrorResponse>

  function getBody(ctx: koa.Context): any {
    return ctx.request.body
  }
  export const bodyP = common.Parser.bodyP(getBody)
  export const body = common.Parser.body(getBody)

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

export type Route<Response extends common.Response.Generic> = common.Route<
  koa.Context,
  Response
>

type GenericRoute = Route<common.Response.Generic>

export function applyMiddleware<Middleware extends Middleware.Generic[]>(
  ...outsideMiddleware: Middleware
): common.RouteFn<koa.Context, KoaRequestBase, Middleware> {
  return ((method: common.URL.Method, ...segments: any[]) => {
    const urlParser = common.URL.url(method, ...segments)()
    return ((...middleware: any[]) =>
      common.route(makeRequestBase, getRouteParams, urlParser, [
        ...outsideMiddleware,
        ...middleware,
      ])) as any
  }) as any
}

export const route = applyMiddleware()

class Router {
  private _routes: GenericRoute[]

  constructor(...routes: GenericRoute[]) {
    this._routes = routes
  }

  add(...routes: GenericRoute[]): Router {
    return new Router(...this._routes.concat(routes))
  }

  handler(): koa.Middleware {
    const router = new koaRouter()
    this._routes.forEach(route => {
      router[route.method](route.urlPattern, run(route.routeHandler))
    })
    return router.routes() as koa.Middleware<any, any>
  }
}

export function router(...routes: Route<common.Response.Generic>[]): Router {
  return new Router(...routes)
}

export type RouteHandler<
  Response extends common.Response.Generic
> = common.RouteHandler<koa.Context, Response>

export function routeHandler<Middleware extends Middleware.Generic[]>(
  ...middleware: Middleware
): common.MakeRouteHandler<koa.Context, KoaRequestBase, Middleware> {
  return common.routeHandler(makeRequestBase, middleware)
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
    ctx.response.body = response.body || ''
  }
}
