import * as Either from 'fp-ts/lib/Either'

import * as Middleware from './middleware'
import * as Parser from './parser'
import * as Response from './response'
import * as URL from './url'

export { Middleware, Parser, Response, URL }

// A request handler takes a request and produces a response

export type RequestHandler<Request, Response> = (
  request: Request
) => Response | Promise<Response>

export type RouteFn<
  ParamConversions,
  Request,
  Response extends Response.Generic
> = {
  <Path extends string>(method: URL.Method, path: Path): MakeRoute<
    Request,
    ParamConversions,
    Path,
    Response
  >
  useParamConversions<T extends URL.Conversions>(
    conversions: T
  ): RouteFn<ParamConversions & URL.GetConversionTypes<T>, Request, Response>
  use<Middleware extends Middleware.Generic<Request>[]>(
    ...middleware: Middleware
  ): TypesFromMiddleware<Request, Middleware> extends MiddlewareType<
    infer MiddlewareResult,
    infer MiddlewareResponse
  >
    ? RouteFn<
        ParamConversions,
        Request & MiddlewareResult,
        Response | MiddlewareResponse
      >
    : never
} & {
  [M in URL.Method]: <Path extends string>(
    path: Path
  ) => MakeRoute<Request, ParamConversions, Path, Response>
}

export type ApplyMiddleware<
  Request,
  Middleware extends Middleware.Generic<Request>[]
> = TypesFromMiddleware<Request, Middleware> extends MiddlewareType<
  infer MiddlewareResult,
  infer MiddlewareResponse
>
  ? RouteFn<
      URL.BuiltinConversions,
      Request & MiddlewareResult,
      MiddlewareResponse
    >
  : never

export function applyMiddleware<
  Request,
  Middleware extends Middleware.Generic<Request>[]
>(
  getRouteParams: (req: Request) => {},
  outsideMiddleware: Middleware,
  paramConversions = URL.builtinConversions
): ApplyMiddleware<Request, Middleware> {
  const routeFn = (method: URL.Method, path: string) =>
    makeRouteConstructor(
      getRouteParams,
      paramConversions,
      method,
      path,
      outsideMiddleware
    )

  routeFn.useParamConversions = (conversions: URL.Conversions) =>
    applyMiddleware(getRouteParams, outsideMiddleware, {
      ...paramConversions,
      ...conversions,
    })

  routeFn.use = (...middleware: any[]) =>
    applyMiddleware(
      getRouteParams,
      [...outsideMiddleware, ...middleware],
      paramConversions
    )

  routeFn.get = (path: string) => routeFn('get', path)
  routeFn.post = (path: string) => routeFn('post', path)
  routeFn.put = (path: string) => routeFn('put', path)
  routeFn.delete = (path: string) => routeFn('delete', path)
  routeFn.head = (path: string) => routeFn('head', path)
  routeFn.options = (path: string) => routeFn('options', path)
  routeFn.patch = (path: string) => routeFn('patch', path)
  routeFn.all = (path: string) => routeFn('all', path)

  return routeFn as any
}

function makeRouteConstructor<Request>(
  getRouteParams: (req: Request) => {},
  paramConversions: URL.Conversions,
  method: URL.Method,
  path: string,
  middleware: any[]
) {
  const urlParser = URL.url(paramConversions, method, path)
  return {
    use: (...nextMiddleware: any[]) =>
      makeRouteConstructor(getRouteParams, paramConversions, method, path, [
        ...middleware,
        ...nextMiddleware,
      ]),
    handler: route(getRouteParams, urlParser, middleware),
  }
}

export type Route<Response extends Response.Generic> = {
  method: URL.Method
  path: string
  routeHandler: (req: unknown) => Promise<Response>
}

export function route<
  RequestBase,
  Middleware extends Middleware.Generic<RequestBase>[]
>(
  getRouteParams: (req: RequestBase) => {},
  pathParser: URL.PathParser,
  middleware: Middleware
): any {
  return ((handler: (req: any) => any) => ({
    method: pathParser.method,
    path: pathParser.pattern,
    routeHandler: async (requestBase: RequestBase) => {
      const routeParams = pathParser.parse(getRouteParams(requestBase))
      if (Either.isLeft(routeParams)) return routeParams.left

      const middlewareOutput = await runMiddleware(
        { ...requestBase, routeParams: routeParams.right },
        middleware
      )
      if (Either.isLeft(middlewareOutput)) {
        // Finalizers have already run in this case
        return middlewareOutput.left
      }

      const { request, runFinalizers } = middlewareOutput.right

      let response
      try {
        response = await handler(request)
      } finally {
        await runFinalizers()
      }
      return response
    },
  })) as any
}

// Helpers

function isMiddlewareResponse<Result, Response>(
  v: Middleware.MiddlewareOutput<Result, Response>
): v is Middleware.MiddlewareResponse<Response> {
  return (
    Object.prototype.hasOwnProperty.call(v, 'response') &&
    !Object.prototype.hasOwnProperty.call(v, 'value')
  )
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
    { request: RequestBase; runFinalizers: () => Promise<void> }
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
      if (output.finalizer !== undefined) {
        finalizers.push(output.finalizer)
      }
      if (output.value !== undefined) {
        request = { ...request, ...output.value }
      }
    }
  }
  return Either.right({ request, runFinalizers })
}

export type MakeRoute<
  Request,
  ParamConversions,
  Path extends string,
  OutsideMiddlewareResponse extends Response.Generic = never
> = URL.PathToCaptures<Path, ParamConversions> extends infer URLCaptures
  ? RouteConstructor<
      Request & { routeParams: URLCaptures },
      OutsideMiddlewareResponse
    >
  : never

interface RouteConstructor<
  Request,
  OutsideMiddlewareResponse extends Response.Generic = never
> {
  use<Middleware extends Middleware.Generic<Request>[]>(
    ...middleware: Middleware
  ): TypesFromMiddleware<Request, Middleware> extends MiddlewareType<
    infer MiddlewareResult,
    infer MiddlewareResponse
  >
    ? RouteConstructor<
        Request & MiddlewareResult,
        MiddlewareResponse | OutsideMiddlewareResponse
      >
    : never
  handler<Response extends Response.Generic>(
    fn: RequestHandler<Request, Response>
  ): Route<Response | OutsideMiddlewareResponse>
}

export interface MiddlewareType<Result, Response extends Response.Generic> {
  _result: Result
  _response: Response
}

type TypesFromMiddleware<Request, Middleware> = Middleware extends [
  infer First,
  ...infer Rest
]
  ? First extends Middleware.Middleware<Request, infer Result, infer Response>
    ? TypesFromMiddleware<Request, Rest> extends MiddlewareType<
        infer ResultTail,
        infer ResponseTail
      >
      ? MiddlewareType<Result & ResultTail, Response | ResponseTail>
      : never
    : never
  : MiddlewareType<{}, never>
