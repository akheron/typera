import * as Foldable from 'fp-ts/lib/Foldable'
import * as Either from 'fp-ts/lib/Either'
import * as Array from 'fp-ts/lib/Array'
import { identity } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'

import * as Parser from './parser'
import * as Response from './response'

export { Parser, Response }

const foldM_E_A = Foldable.foldM(Either.either, Array.array)

// A request handler takes a request and produces a response

export type RequestHandler<Request, Response> = (
  request: Request
) => Response | Promise<Response>

// Create a route handler from request parsers and a function that
// takes a request and returns a response

export type RouteHandler<Input, Response extends Response.Generic> = (
  input: Input
) => Promise<Response>

export function routeHandler<
  Input,
  RequestBase extends {},
  Parsers extends Parser.Parser<Input, any, any>[]
>(
  makeRequestBase: (input: Input) => RequestBase,
  parsers: Parsers
): MakeRouteHandler<Input, RequestBase, Parsers> {
  const parseRequest = (input: Input) =>
    foldM_E_A(parsers, Either.right(makeRequestBase(input)), (acc, parser) =>
      pipe(
        parser(input),
        v => ({ ...acc, ...v })
      )
    )

  return <any>((handler: any) => (input: Input) =>
    pipe(
      parseRequest(input),
      Either.map(handler),
      Either.getOrElse(identity)
    ))
}

// Helpers

export type MakeRouteHandler<
  Input,
  RequestBase extends {},
  Parsers extends Parser.Parser<any, any, any>[]
> = TypesFromParsers<RequestBase, Parsers> extends ParserType<
  infer Request,
  infer ParserResponses
>
  ? <Response extends Response.Generic>(
      handler: RequestHandler<Request, Response>
    ) => RouteHandler<Input, Response | ParserResponses>
  : never

export type ParseRequest<
  Input,
  RequestBase extends {},
  Parsers extends Parser.Parser<Input, any, any>[]
> = TypesFromParsers<RequestBase, Parsers> extends ParserType<
  infer Request,
  infer ParserResponses
>
  ? (input: Input) => Either.Either<ParserResponses, Request>
  : never

interface ParserType<
  Request extends {},
  ParserResponse extends Response.Generic
> {
  _req: Request
  _err: ParserResponse
}

type TypesFromParsers<
  RequestBase extends {},
  Parsers extends Parser.Parser<any, any, any>[]
> = {
  0: Head<Parsers> extends Parser.Parser<any, infer R, infer E>
    ? TypesFromParsers<RequestBase, Tail<Parsers>> extends ParserType<
        infer RR,
        infer EE
      >
      ? ParserType<R & RR, E | EE>
      : never
    : never
  1: ParserType<RequestBase, never>
}[Length<Parsers> extends 0 ? 1 : 0]

type Length<T extends any[]> = T['length']
type Head<T extends any[]> = T extends [infer U, ...any[]] ? U : never
type Tail<T extends any[]> = ((...args: T) => any) extends ((
  _: any,
  ...rest: infer U
) => any)
  ? U
  : never
