import * as koa from 'koa'
import * as koaRouter from '@koa/router'
import 'koa-bodyparser' // Adds `body` to ctx.request
import * as stream from 'stream'

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
): common.ApplyMiddleware<RequestBase, Middleware> {
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

  handler(): koa.Middleware {
    const router = new koaRouter()
    this._routes.forEach((route) => {
      router[route.method](route.path, run(route.routeHandler))
    })
    return router.routes() as koa.Middleware<any, any>
  }
}
export type { Router }

export function router(...routes: Route<common.Response.Generic>[]): Router {
  return new Router(...routes)
}

function run<Response extends common.Response.Generic>(
  handler: (req: unknown) => Promise<Response>
): (ctx: koa.Context) => Promise<void> {
  return async (ctx) => {
    const response = await handler({ ctx })
    ctx.response.status = response.status
    if (response.headers != null) {
      ctx.response.set(response.headers)
    }
    if (Response.isStreamingBody(response.body)) {
      const pt = (ctx.body = new stream.PassThrough())
      response.body.callback(pt)
    } else if (
      typeof response.body === 'string' ||
      typeof response.body === 'number' ||
      typeof response.body === 'boolean' ||
      response.body === null ||
      response.body === undefined
    ) {
      if (response.body === null || response.body === undefined) {
        // Leaving body as-is would make koa set it to e.g. "OK" based on status
        // code. Set it to empty string instead, and remove the automatically
        // added Content-Type header.
        const userSetContentType = !!ctx.response.get('Content-Type')
        ctx.response.body = ''
        if (!userSetContentType) ctx.response.remove('Content-Type')
      } else {
        if (!ctx.response.get('Content-Type')) {
          ctx.response.set('Content-Type', 'text/plain')
        }
        ctx.response.body = response.body.toString()
      }
    } else {
      ctx.response.body = response.body
    }
  }
}
