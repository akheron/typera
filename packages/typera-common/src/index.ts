import * as Either from 'fp-ts/lib/Either'
import { identity } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'

import * as Middleware from './middleware'
import * as Parser from './parser'
import * as Response from './response'

export { Middleware, Parser, Response }

// A request handler takes a request and produces a response

export type RequestHandler<Request, Response> = (
  request: Request
) => Response | Promise<Response>

// Create a route handler from middleware and a function that takes a
// request and returns a response

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
  async function runMiddleware(
    input: Input
  ): Promise<Either.Either<Response.Generic, any>> {
    let request = makeRequestBase(input)
    for (const middlewareFunc of middleware) {
      const result = await middlewareFunc(input)
      if (Either.isLeft(result)) {
        return result
      }
      request = { ...request, ...result.right }
    }
    return Either.right(request)
  }

  return <any>(<Request extends any, Response extends Response.Generic>(
    handler: (req: Request) => Response
  ) => async (input: Input) =>
    pipe(
      await runMiddleware(input),
      Either.map(handler),
      Either.getOrElse(identity)
    ))
}

// Helpers

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

type Length<T extends any[]> = T['length']
type Head<T extends any[]> = T extends [infer U, ...any[]] ? U : never
type Tail<T extends any[]> = ((...args: T) => any) extends ((
  _: any,
  ...rest: infer U
) => any)
  ? U
  : never
