import * as Either from 'fp-ts/lib/Either'
import * as Response from './response'

export type Middleware<
  Input,
  Result extends {},
  Response extends Response.Generic
> = (
  input: Input
) => Either.Either<Response, Result> | Promise<Either.Either<Response, Result>>

export type Generic<Input> = Middleware<Input, {}, Response.Generic>
