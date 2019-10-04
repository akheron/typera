import * as Apply from 'fp-ts/lib/Apply'
import * as Array from 'fp-ts/lib/Array'
import * as Either from 'fp-ts/lib/Either'
import * as Foldable from 'fp-ts/lib/Foldable'
import * as Option from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { IntFromString } from 'io-ts-types/lib/IntFromString'

const foldM_O_A = Foldable.foldM(Option.option, Array.array)

import * as Response from './response'
import { Head, Tail, Length } from './utils'

export type Method =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'head'
  | 'options'
  | 'patch'
  | 'all'

export type PathCapture<K extends string = string, T = any> = {
  (routeParams: {}): Option.Option<{ [KK in K]: T }>
  pattern: string
}

export type PathSegmentsToCaptures<
  Segments extends Array<PathCapture | string>
> = {
  0: Head<Segments> extends PathCapture<infer K, infer T>
    ? { [KK in K]: T } & PathSegmentsToCaptures<Tail<Segments>>
    : PathSegmentsToCaptures<Tail<Segments>>
  1: {}
}[Length<Segments> extends 0 ? 1 : 0]

export type URLParser<Captures> = {
  method: Method
  urlPattern: string
  parse(routeParams: {}): Either.Either<Response.Generic, Captures>
}

export function url<PathSegments extends Array<PathCapture | string>>(
  method: Method,
  ...segments: PathSegments
): () => URLParser<PathSegmentsToCaptures<PathSegments>> {
  return () => {
    const urlPattern =
      segments.length > 0
        ? segments
            .map(segment =>
              isPathCapture(segment) ? segment.pattern : segment
            )
            .join('')
        : '/'
    const capturers: PathCapture[] = segments.filter(isPathCapture)
    return {
      method,
      urlPattern,
      parse: (routeParams: {}) => {
        const captures = capturers.map(capturer => capturer(routeParams))
        return pipe(
          foldM_O_A(captures, {}, (acc, obj) => ({
            ...acc,
            ...obj,
          })),
          Either.fromOption(Response.notFound)
        ) as any
      },
    }
  }
}

function isPathCapture(s: PathCapture | string): s is PathCapture {
  return typeof s !== 'string'
}

export function str<Param extends string>(
  param: Param
): PathCapture<Param, string> {
  function stringParser(routeParams: any) {
    const value = routeParams[param]
    if (typeof value !== 'string') return Option.none
    return Option.some({ [param]: value } as any)
  }
  stringParser.pattern = `:${param}`
  return stringParser
}

export function int<Param extends string>(
  param: Param
): PathCapture<Param, number> {
  function intParser(routeParams: any) {
    const value = routeParams[param]
    const result = IntFromString.decode(value)
    if (Either.isLeft(result)) return Option.none
    return Option.some({ [param]: result.right } as any)
  }
  intParser.pattern = `:${param}(\\d+)`
  return intParser
}
