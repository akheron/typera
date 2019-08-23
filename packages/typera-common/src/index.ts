import { foldM } from 'fp-ts/lib/Foldable'
import { Either, either, right, getOrElse } from 'fp-ts/lib/Either'
import { array } from 'fp-ts/lib/Array'
import { identity } from 'fp-ts/lib/function'

import Parser from './parser'
import Response from './response'

export { Parser, Response }

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
    foldM(either, array)(
      parsers,
      right(makeRequestBase(input)),
      (acc, parser) => either.map(parser(input), v => ({ ...acc, ...v }))
    )

  return <any>(
    ((handler: any) => (input: Input) =>
      getOrElse(identity)(either.map(parseRequest(input), handler)))
  )
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
  ? (input: Input) => Either<ParserResponses, Request>
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
