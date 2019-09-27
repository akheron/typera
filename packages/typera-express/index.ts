import { identity } from 'fp-ts/lib/function'
import * as express from 'express'

import * as common from 'typera-common'
export { Response, RequestHandler } from 'typera-common'

export interface ExpressContext {
  req: express.Request
  res: express.Response
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

  function getRouteParams(e: ExpressContext): any {
    return e.req.params
  }
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
