import * as Either from 'fp-ts/lib/Either'

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
export type RouteFn<
  Request,
  Middleware extends Array<Middleware.Generic<Request>>,
  OutsideMiddlewareResponse extends Response.Generic = never
> = TypesFromMiddleware<Request, Middleware> extends MiddlewareType<
  infer MiddlewareResult,
  infer MiddlewareResponse
>
  ? RouteFnImpl<
      MiddlewareResult,
      MiddlewareResponse | OutsideMiddlewareResponse
    >
  : never

type RouteFnImpl<
  Request,
  OutsideMiddlewareResponse extends Response.Generic
> = {
  <PathSegments extends Array<URL.PathCapture | string>>(
    method: URL.Method,
    ...segments: PathSegments
  ): MakeRoute<Request, PathSegments, OutsideMiddlewareResponse>
  use<Middleware extends Array<Middleware.Generic<Request>>>(
    ...middleware: Middleware
  ): RouteFn<Request, Middleware, OutsideMiddlewareResponse>
} & {
  [M in URL.Method]: <PathSegments extends Array<URL.PathCapture | string>>(
    ...segments: PathSegments
  ) => MakeRoute<Request, PathSegments, OutsideMiddlewareResponse>
}

export function applyMiddleware<
  Request,
  Middleware extends Middleware.Generic<Request>[]
>(getRouteParams: (req: Request) => {}, outsideMiddleware: Middleware): any {
  const routeFn = (method: URL.Method, ...segments: any[]) => {
    const urlParser = URL.url(method, ...segments)()
    return (...middleware: any[]) =>
      route(getRouteParams, urlParser, [...outsideMiddleware, ...middleware])
  }
  routeFn.use = (...middleware: any[]) =>
    applyMiddleware(getRouteParams, [...outsideMiddleware, ...middleware])

  routeFn.get = (...segments: any[]) => routeFn('get', ...segments)
  routeFn.post = (...segments: any[]) => routeFn('post', ...segments)
  routeFn.put = (...segments: any[]) => routeFn('put', ...segments)
  routeFn.delete = (...segments: any[]) => routeFn('delete', ...segments)
  routeFn.head = (...segments: any[]) => routeFn('head', ...segments)
  routeFn.options = (...segments: any[]) => routeFn('options', ...segments)
  routeFn.patch = (...segments: any[]) => routeFn('patch', ...segments)
  routeFn.all = (...segments: any[]) => routeFn('all', ...segments)

  return routeFn as any
}

export type Route<Request, Response extends Response.Generic> = {
  method: URL.Method
  urlPattern: string
  routeHandler: (req: Request) => Promise<Response>
}

export function route<
  RequestBase,
  URLCaptures,
  Middleware extends Middleware.Generic<RequestBase>[]
>(
  getRouteParams: (req: RequestBase) => {},
  urlParser: URL.URLParser<URLCaptures>,
  middleware: Middleware
): any {
  return ((handler: (req: any) => any) => ({
    method: urlParser.method,
    urlPattern: urlParser.urlPattern,
    routeHandler: async (requestBase: RequestBase) => {
      const routeParams = urlParser.parse(getRouteParams(requestBase))
      if (Either.isLeft(routeParams)) return routeParams.left

      const middlewareOutput = await runMiddleware(requestBase, middleware)
      if (Either.isLeft(middlewareOutput)) {
        // Finalizers have already run in this case
        return middlewareOutput.left
      }

      let response
      try {
        response = await handler({
          ...middlewareOutput.right.request,
          routeParams: routeParams.right,
        })
      } finally {
        await middlewareOutput.right.runFinalizers()
      }
      return response
    },
  })) as any
}

// Create a route handler from middleware and a request handler

export type RouteHandler<Input, Response extends Response.Generic> = (
  input: Input
) => Promise<Response>

export function routeHandler<
  RequestBase,
  Middleware extends Middleware.Generic<RequestBase>[]
>(middleware: Middleware): MakeRouteHandler<RequestBase, Middleware> {
  return ((handler: (req: any) => Promise<any>) => async (req: RequestBase) => {
    const middlewareOutput = await runMiddleware(req, middleware)
    if (Either.isLeft(middlewareOutput)) {
      // Finalizers have already run in this case
      return middlewareOutput.left
    }

    let response
    try {
      response = await handler(middlewareOutput.right.request as Request)
    } finally {
      await middlewareOutput.right.runFinalizers()
    }
    return response
  }) as any
}

// Helpers

function isMiddlewareResponse<Result, Response>(
  v: Middleware.MiddlewareOutput<Result, Response>
): v is Middleware.MiddlewareResponse<Response> {
  return v.hasOwnProperty('response') && !v.hasOwnProperty('value')
}

async function runMiddleware<
  RequestBase,
  Middleware extends Middleware.Generic<RequestBase>[]
>(
  requestBase: RequestBase,
  middleware: Middleware
): Promise<
  Either.Either<
    Response.Generic,
    { request: {}; runFinalizers: () => Promise<void> }
  >
> {
  let request = requestBase

  const finalizers: Array<Middleware.MiddlewareFinalizer> = []

  async function runFinalizers() {
    // Run finalizers in the reverse order
    for (const finalizer of [...finalizers].reverse()) {
      try {
        await finalizer()
      } catch (err) {
        // Log and ignore finalizer errors
        console.error('Ignoring an exception from middleware finalizer', err)
      }
    }
  }

  for (const middlewareFunc of middleware) {
    let output
    try {
      output = await middlewareFunc(request)
    } catch (err) {
      await runFinalizers()
      throw err
    }

    if (isMiddlewareResponse(output)) {
      await runFinalizers()
      return Either.left(output.response)
    } else {
      if (output.finalizer != null) finalizers.push(output.finalizer)
      request = { ...request, ...output.value }
    }
  }
  return Either.right({ request, runFinalizers })
}

export type MakeRoute<
  Request,
  PathSegments extends Array<URL.PathCapture | string>,
  OutsideMiddlewareResponse extends Response.Generic = never
> = URL.PathSegmentsToCaptures<PathSegments> extends infer URLCaptures
  ? <Middleware extends Array<Middleware.Generic<Request>>>(
      ...middleware: Middleware
    ) => TypesFromMiddleware<Request, Middleware> extends MiddlewareType<
      infer MiddlewareResult,
      infer MiddlewareResponse
    >
      ? <Response extends Response.Generic>(
          handler: RequestHandler<
            MiddlewareResult & { routeParams: URLCaptures },
            Response
          >
        ) => Route<
          Request,
          Response | MiddlewareResponse | OutsideMiddlewareResponse
        >
      : never
  : never

export type MakeRouteHandler<
  Request,
  Middleware extends Middleware.Generic<Request>[]
> = TypesFromMiddleware<Request, Middleware> extends MiddlewareType<
  infer MiddlewareResult,
  infer MiddlewareResponse
>
  ? <Response extends Response.Generic>(
      handler: RequestHandler<MiddlewareResult, Response>
    ) => RouteHandler<Request, Response | MiddlewareResponse>
  : never

export interface MiddlewareType<Result, Response extends Response.Generic> {
  _result: Result
  _response: Response
}

type TypesFromMiddleware<
  Request,
  Middleware extends Middleware.Generic<Request>[]
> = {
  0: Head<Middleware> extends Middleware.Middleware<
    Request,
    infer Result,
    infer Response
  >
    ? TypesFromMiddleware<Request, Tail<Middleware>> extends MiddlewareType<
        infer ResultTail,
        infer ResponseTail
      >
      ? MiddlewareType<Result & ResultTail, Response | ResponseTail>
      : never
    : never
  1: MiddlewareType<Request, never>
}[Length<Middleware> extends 0 ? 1 : 0]
