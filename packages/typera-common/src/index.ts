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
  Input,
  RequestBase extends {},
  Middleware extends Array<Middleware.Generic<Input>>,
  OutsideMiddlewareResult extends {} = {},
  OutsideMiddlewareResponse extends Response.Generic = never
> = TypesFromMiddleware<Input, RequestBase, Middleware> extends MiddlewareType<
  infer MiddlewareResult,
  infer MiddlewareResponse
>
  ? RouteFnImpl<
      Input,
      RequestBase,
      MiddlewareResult & OutsideMiddlewareResult,
      MiddlewareResponse | OutsideMiddlewareResponse
    >
  : never

type RouteFnImpl<
  Input,
  RequestBase extends {},
  OutsideMiddlewareResult extends {},
  OutsideMiddlewareResponse extends Response.Generic
> = {
  <PathSegments extends Array<URL.PathCapture | string>>(
    method: URL.Method,
    ...segments: PathSegments
  ): MakeRoute<
    Input,
    RequestBase,
    PathSegments,
    OutsideMiddlewareResult,
    OutsideMiddlewareResponse
  >
  use<Middleware extends Array<Middleware.Generic<Input>>>(
    ...middleware: Middleware
  ): RouteFn<
    Input,
    RequestBase,
    Middleware,
    OutsideMiddlewareResult,
    OutsideMiddlewareResponse
  >
} & {
  [M in URL.Method]: <PathSegments extends Array<URL.PathCapture | string>>(
    ...segments: PathSegments
  ) => MakeRoute<
    Input,
    RequestBase,
    PathSegments,
    OutsideMiddlewareResult,
    OutsideMiddlewareResponse
  >
}

export function applyMiddleware<
  Input,
  RequestBase extends {},
  Middleware extends Middleware.Generic<Input>[]
>(
  makeRequestBase: (input: Input) => RequestBase,
  getRouteParams: (input: Input) => {},
  outsideMiddleware: Middleware
): any {
  const routeFn = (method: URL.Method, ...segments: any[]) => {
    const urlParser = URL.url(method, ...segments)()
    return (...middleware: any[]) =>
      route(makeRequestBase, getRouteParams, urlParser, [
        ...outsideMiddleware,
        ...middleware,
      ])
  }
  routeFn.use = (...middleware: any[]) =>
    applyMiddleware(makeRequestBase, getRouteParams, [
      ...outsideMiddleware,
      ...middleware,
    ])

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

      const middlewareOutput = await runMiddleware(
        requestBase,
        middleware,
        input
      )
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
        await middlewareOutput.right.runFinalizers(input)
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
  Input,
  RequestBase extends {},
  Middleware extends Middleware.Generic<Input>[]
>(
  makeRequestBase: (input: Input) => RequestBase,
  middleware: Middleware
): MakeRouteHandler<Input, RequestBase, Middleware> {
  return ((handler: (req: any) => Promise<any>) => async (input: Input) => {
    const requestBase = makeRequestBase(input)
    const middlewareOutput = await runMiddleware(requestBase, middleware, input)
    if (Either.isLeft(middlewareOutput)) {
      // Finalizers have already run in this case
      return middlewareOutput.left
    }

    let response
    try {
      response = await handler(middlewareOutput.right.request as Request)
    } finally {
      await middlewareOutput.right.runFinalizers(input)
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
  Input,
  RequestBase extends {},
  Middleware extends Middleware.Generic<Input>[]
>(
  requestBase: RequestBase,
  middleware: Middleware,
  input: Input
): Promise<
  Either.Either<
    Response.Generic,
    { request: {}; runFinalizers: (input: Input) => Promise<void> }
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
      output = await middlewareFunc(input)
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
  Input,
  RequestBase extends {},
  PathSegments extends Array<URL.PathCapture | string>,
  OutsideMiddlewareResult extends {} = {},
  OutsideMiddlewareResponse extends Response.Generic = never
> = URL.PathSegmentsToCaptures<PathSegments> extends infer URLCaptures
  ? <Middleware extends Array<Middleware.Generic<Input>>>(
      ...middleware: Middleware
    ) => TypesFromMiddleware<
      Input,
      RequestBase,
      Middleware
    > extends MiddlewareType<infer MiddlewareResult, infer MiddlewareResponse>
      ? <Response extends Response.Generic>(
          handler: RequestHandler<
            MiddlewareResult &
              OutsideMiddlewareResult & { routeParams: URLCaptures },
            Response
          >
        ) => Route<
          Input,
          Response | MiddlewareResponse | OutsideMiddlewareResponse
        >
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

export interface MiddlewareType<
  Result extends {},
  Response extends Response.Generic
> {
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
