import * as Either from 'fp-ts/lib/Either'
import { identity } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'

import * as Middleware from './middleware'
import * as Parser from './parser'
import * as Response from './response'
import * as URL from './url'
import { Head, Tail, Length } from './utils'

export { Middleware, Parser, Response, URL }

// A request handler takes a request and produces a response

export type RequestHandler<Request, Response> = (
  request: Request
) => Response | Promise<Response>

// Create a route from url parser, middleware and a request handler

export type Route<Input, Response extends Response.Generic> = {
  method: URL.Method
  urlPattern: string
  routeHandler: (input: Input) => Promise<Response>
}

export function route<
  Input,
  RequestBase extends {},
  URLCaptures,
  Middleware extends Middleware.Generic<Input>[]
>(
  makeRequestBase: (input: Input) => RequestBase,
  getRouteParams: (input: Input) => {},
  urlParser: URL.URLParser<URLCaptures>,
  middleware: Middleware
): any {
  return ((handler: (req: any) => any) => ({
    method: urlParser.method,
    urlPattern: urlParser.urlPattern,
    routeHandler: async (input: Input) => {
      const requestBase = makeRequestBase(input)
      const routeParams = urlParser.parse(getRouteParams(input))
      if (Either.isLeft(routeParams)) return routeParams.left
      const middlewareReq = await runMiddleware(requestBase, middleware, input)
      if (Either.isLeft(middlewareReq)) return middlewareReq.left
      return await handler({
        ...middlewareReq.right,
        routeParams: routeParams.right,
      })
    },
  })) as any
}

// Create a route handler from middleware and a request handler

export type RouteHandler<Input, Response extends Response.Generic> = (
  input: Input
) => Promise<Response>

export function routeHandler<
  Input,
  RequestBase extends {},
  Middleware extends Middleware.Generic<Input>[]
>(
  makeRequestBase: (input: Input) => RequestBase,
  middleware: Middleware
): MakeRouteHandler<Input, RequestBase, Middleware> {
  return ((handler: (req: any) => Promise<any>) => async (input: Input) => {
    const requestBase = makeRequestBase(input)
    const req = await runMiddleware(requestBase, middleware, input)
    if (Either.isLeft(req)) return req.left
    return await handler(req.right as Request)
  }) as any
}

// Helpers

async function runMiddleware<
  Input,
  RequestBase extends {},
  Middleware extends Middleware.Generic<Input>[]
>(
  requestBase: RequestBase,
  middleware: Middleware,
  input: Input
): Promise<Either.Either<Response.Generic, {}>> {
  let request = requestBase
  for (const middlewareFunc of middleware) {
    const result = await middlewareFunc(input)
    if (Either.isLeft(result)) {
      return result
    }
    request = { ...request, ...result.right }
  }
  return Either.right(request)
}

export type MakeRoute<
  Input,
  RequestBase extends {},
  PathSegments extends Array<URL.PathCapture | string>
> = URL.PathSegmentsToCaptures<PathSegments> extends infer URLCaptures
  ? <Middleware extends Middleware.Generic<Input>[]>(
      ...middleware: Middleware
    ) => TypesFromMiddleware<
      Input,
      RequestBase,
      Middleware
    > extends MiddlewareType<infer MiddlewareResult, infer MiddlewareResponse>
      ? <Response extends Response.Generic>(
          handler: RequestHandler<
            MiddlewareResult & { routeParams: URLCaptures },
            Response
          >
        ) => Route<Input, Response | MiddlewareResponse>
      : never
  : never

export type MakeRouteHandler<
  Input,
  RequestBase extends {},
  Middleware extends Middleware.Generic<Input>[]
> = TypesFromMiddleware<Input, RequestBase, Middleware> extends MiddlewareType<
  infer MiddlewareResult,
  infer MiddlewareResponse
>
  ? <Response extends Response.Generic>(
      handler: RequestHandler<MiddlewareResult, Response>
    ) => RouteHandler<Input, Response | MiddlewareResponse>
  : never

interface MiddlewareType<Result extends {}, Response extends Response.Generic> {
  _result: Result
  _response: Response
}

type TypesFromMiddleware<
  Input,
  RequestBase extends {},
  Middleware extends Middleware.Generic<Input>[]
> = {
  0: Head<Middleware> extends Middleware.Middleware<
    Input,
    infer Result,
    infer Response
  >
    ? TypesFromMiddleware<
        Input,
        RequestBase,
        Tail<Middleware>
      > extends MiddlewareType<infer ResultTail, infer ResponseTail>
      ? MiddlewareType<Result & ResultTail, Response | ResponseTail>
      : never
    : never
  1: MiddlewareType<RequestBase, never>
}[Length<Middleware> extends 0 ? 1 : 0]
