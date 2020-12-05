import express = require('express')

import * as common from 'typera-common'
import { Route } from 'typera-common'
export { RequestHandler, Route } from 'typera-common'

import { RequestBase, getRouteParams } from './context'
import * as Middleware from './middleware'
import * as Parser from './parser'
import * as Response from './response'
import * as URL from './url'
export { RequestBase, Middleware, Parser, Response, URL }

export function applyMiddleware<Middleware extends Middleware.Generic[]>(
  ...middleware: Middleware
): common.RouteFn<URL.BuiltinConversions, RequestBase, Middleware> {
  return common.applyMiddleware(getRouteParams, middleware)
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
      router[route.method](route.path, run(route.routeHandler))
    })
    return router
  }
}

export function router(...routes: Route<common.Response.Generic>[]): Router {
  return new Router(...routes)
}

function run<Response extends common.Response.Generic>(
  handler: (req: unknown) => Promise<Response>
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
      if (Response.isStreamingBody(response.body)) {
        response.body.callback(res)
      } else {
        res.send(response.body)
      }
    } else {
      res.end()
    }
  }
}
