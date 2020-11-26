import * as Either from 'fp-ts/lib/Either'
import { IntFromString } from 'io-ts-types/lib/IntFromString'

import * as Response from './response'

export type Method =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'head'
  | 'options'
  | 'patch'
  | 'all'

export type SplitBy<
  Delim extends string,
  Input
> = Input extends `${infer First}${Delim}${infer Rest}`
  ? [First, ...SplitBy<Delim, Rest>]
  : [Input]

type SplitEach<Delim extends string, Input> = Input extends [
  infer Head,
  ...infer Tail
]
  ? [...SplitBy<Delim, Head>, ...SplitEach<Delim, Tail>]
  : []

type Split<Input> = SplitEach<'-', SplitEach<'.', SplitEach<'/', [Input]>>>

type ParamsFrom<Parts> = Parts extends [infer First, ...infer Rest]
  ? First extends `:${infer Param}(int)`
    ? { [K in Param]: number } & ParamsFrom<Rest>
    : First extends `:${infer Param}`
    ? { [K in Param]: string } & ParamsFrom<Rest>
    : ParamsFrom<Rest>
  : {}

export type PathToCaptures<Path> = ParamsFrom<Split<Path>>

export type PathParser<Captures> = {
  method: Method
  pattern: string
  parse(routeParams: {}): Either.Either<Response.Generic, Captures>
}

export function url<Path extends string>(
  method: Method,
  path: Path
): PathParser<PathToCaptures<Path>> {
  const pattern = path.replace(/\(int\)/g, '(\\d+)')
  const intCaptures = path
    .split('/')
    .map(s => s.split('.'))
    .flat()
    .map(s => s.split('-'))
    .flat()
    .filter(s => s.startsWith(':') && s.endsWith('(int)'))
    .map(s => s.replace(/^:(.*?)\(int\)$/, '$1'))
  return {
    method,
    pattern,
    parse: (routeParams: Record<string, string>): any => {
      let fail = false
      const result: Record<string, string | number> = {}
      Object.entries(routeParams).forEach(([key, value]) => {
        if (intCaptures.includes(key)) {
          const decoded = IntFromString.decode(value)
          if (Either.isLeft(decoded)) fail = true
          else result[key] = decoded.right
        } else {
          result[key] = value
        }
      })
      if (fail) return Either.left(Response.notFound())
      return Either.right(result)
    },
  }
}
