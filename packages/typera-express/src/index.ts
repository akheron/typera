import { identity } from 'fp-ts/lib/function'
import express = require('express')

import * as common from 'typera-common'
export { RequestHandler } from 'typera-common'

import { ExpressContext, getRouteParams } from './context'
import * as Middleware from './middleware'
import * as Parser from './parser'
import * as Response from './response'
import * as URL from './url'
export { ExpressContext, Middleware, Parser, Response, URL }

export type Route<Response extends common.Response.Generic> = common.Route<
  ExpressContext,
  Response
>

export function applyMiddleware<Middleware extends Middleware.Generic[]>(
  ...middleware: Middleware
): common.RouteFn<ExpressContext, ExpressContext, Middleware> {
  return common.applyMiddleware(identity, getRouteParams, middleware)
}

export const route = applyMiddleware()

type GenericRoute = Route<common.Response.Generic>

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
): (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => Promise<void> {
  return async (req, res, next) => {
    let response: Response
    try {
      response = await handler({ req, res })
    } catch (err) {
      next(err)
      return
    }
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
