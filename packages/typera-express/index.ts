import { identity } from 'fp-ts/lib/function'
import express = require('express')

import * as common from 'typera-common'
export { Response, RequestHandler, URL } from 'typera-common'
export const url = common.URL.url

export interface ExpressContext {
  req: express.Request
  res: express.Response
}

function getRouteParams(e: ExpressContext): any {
  return e.req.params
}

export namespace Middleware {
  export type Middleware<
    Result extends {},
    Response extends common.Response.Generic
  > = common.Middleware.Middleware<ExpressContext, Result, Response>

  export type Generic = common.Middleware.Middleware<
    ExpressContext,
    {},
    common.Response.Generic
  >
}

export namespace Parser {
  export type ErrorHandler<
    ErrorResponse extends common.Response.Generic
  > = common.Parser.ErrorHandler<ErrorResponse>

  function getBody(e: ExpressContext): any {
    return e.req.body
  }
  export const bodyP = common.Parser.bodyP(getBody)
  export const body = common.Parser.body(getBody)

  export const routeParamsP = common.Parser.routeParamsP(getRouteParams)
  export const routeParams = common.Parser.routeParams(getRouteParams)

  function getQuery(e: ExpressContext): any {
    return e.req.query
  }
  export const queryP = common.Parser.queryP(getQuery)
  export const query = common.Parser.query(getQuery)

  function getHeaders(e: ExpressContext): any {
    return e.req.headers
  }
  export const headersP = common.Parser.headersP(getHeaders)
  export const headers = common.Parser.headers(getHeaders)
}

export type Route<Response extends common.Response.Generic> = common.Route<
  ExpressContext,
  Response
>

type GenericRoute = Route<common.Response.Generic>

export function route<URLCaptures, Middleware extends Middleware.Generic[]>(
  urlParser: common.URL.URLParser<URLCaptures>,
  ...middleware: Middleware
): common.MakeRoute<ExpressContext, ExpressContext, URLCaptures, Middleware> {
  return common.route(identity, getRouteParams, urlParser, middleware)
}

class Router {
  private _routes: GenericRoute[]

  constructor(...routes: GenericRoute[]) {
    this._routes = routes
  }

  add(...routes: GenericRoute[]): Router {
    return new Router(...this._routes.concat(routes))
  }

  handler(): express.Router {
    const router = express.Router()
    this._routes.forEach(route => {
      router[route.method](route.urlPattern, run(route.routeHandler))
    })
    return router
  }
}

export function router(...routes: Route<common.Response.Generic>[]): Router {
  return new Router(...routes)
}

export type RouteHandler<
  Response extends common.Response.Generic
> = common.RouteHandler<ExpressContext, Response>

export function routeHandler<Middleware extends Middleware.Generic[]>(
  ...middleware: Middleware
): common.MakeRouteHandler<ExpressContext, ExpressContext, Middleware> {
  return common.routeHandler(identity, middleware)
}

export function run<Response extends common.Response.Generic>(
  handler: RouteHandler<Response>
): (req: express.Request, res: express.Response) => Promise<void> {
  return async (req, res) => {
    const response = await handler({ req, res })
    res.status(response.status)
    if (response.headers != null) {
      res.set(response.headers)
    }
    if (response.body) {
      res.send(response.body)
    } else {
      res.end()
    }
  }
}
