import * as Response from './response'

export type Middleware<Input, Result, Response extends Response.Generic> = (
  input: Input
) =>
  | MiddlewareOutput<Result, Response>
  | Promise<MiddlewareOutput<Result, Response>>

export type Generic<Input> = Middleware<Input, any, Response.Generic>

export type MiddlewareOutput<Result, Response> =
  | MiddlewareResult<Result>
  | MiddlewareResponse<Response>

export type MiddlewareResult<Result> = {
  value: Result
  finalizer?: MiddlewareFinalizer
}

export type MiddlewareFinalizer = () => void | Promise<void>

export type MiddlewareResponse<Response> = { response: Response }

export function next(): MiddlewareResult<unknown>
export function next<Result>(
  value: Result,
  finalizer?: () => void | Promise<void>
): MiddlewareResult<Result>
export function next(value?: any, finalizer?: any): any {
  if (value == null) return {}
  return { value, finalizer }
}

export function stop<Response extends Response.Generic>(
  response: Response
): MiddlewareResponse<Response> {
  return { response }
}
