import * as Either from 'fp-ts/lib/Either'
import * as Option from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
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

type ParamsFrom<Parts, ParamConversions> = Parts extends [
  infer First,
  ...infer Rest
]
  ? First extends `:${infer Param}(${infer Conv})`
    ? Conv extends keyof ParamConversions
      ? { [K in Param]: ParamConversions[Conv] } &
          ParamsFrom<Rest, ParamConversions>
      : never // TODO: Throw a type error here when it becomes possible
    : First extends `:${infer Param}`
    ? { [K in Param]: string } & ParamsFrom<Rest, ParamConversions>
    : ParamsFrom<Rest, ParamConversions>
  : {}

export type PathToCaptures<Path, ParamConversions> = ParamsFrom<
  Split<Path>,
  ParamConversions
>

export type PathParser = {
  method: Method
  pattern: string
  parse(routeParams: {}): Either.Either<Response.Generic, any>
}

export function url<Path extends string>(
  paramConversions: Conversions,
  method: Method,
  path: Path
): PathParser {
  const pattern = path.replace(/:([^-.()/]+)\(.*?\)/g, ':$1')

  // Object of param -> conversion
  const conversions = Object.fromEntries(
    path
      .split('/')
      .map(s => s.split('.'))
      .flat()
      .map(s => s.split('-'))
      .flat()
      .filter(s => s.startsWith(':') && s.includes('(') && s.includes(')'))
      .map(s => s.split(/:|\(|\)/).slice(1, 3))
  )

  return {
    method,
    pattern,
    parse: (routeParams: Record<string, string>): any => {
      let fail = false
      const result: Record<string, string | number> = {}
      Object.entries(routeParams).forEach(([key, value]) => {
        const conversionName = conversions[key]
        if (conversionName) {
          const conversion = paramConversions[conversionName]
          const decoded = conversion(value)
          if (Option.isNone(decoded)) fail = true
          else result[key] = decoded.value
        } else {
          result[key] = value
        }
      })
      if (fail) return Either.left(Response.notFound())
      return Either.right(result)
    },
  }
}

export type Conversion<T> = (value: string) => Option.Option<T>

export type Conversions = { [K in string]: Conversion<any> }

export type GetConversionTypes<T extends Conversions> = {
  [K in keyof T]: T[K] extends Conversion<infer U> ? U : never
}

export type BuiltinConversions = {
  int: number
}

export const builtinConversions: Conversions = {
  int: value => pipe(IntFromString.decode(value), Option.fromEither),
}
