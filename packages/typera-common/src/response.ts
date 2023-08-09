// This file is generated, do not edit! See ../tools/generate-responses.ts

import { Writable } from 'stream'

type OptionalHeaders = { [key: string]: string } | undefined

export type Response<Status, Body, Headers extends OptionalHeaders> = {
  status: Status
  body: Body
  headers: Headers
}

export type Generic = Response<number, any, OptionalHeaders>

export type Continue<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<100, Body, Headers>
export function continue_<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): Continue<Body, Headers>
export function continue_<Body>(body: Body): Continue<Body, undefined>
export function continue_(): Continue<undefined, undefined>
export function continue_(body = undefined, headers = undefined) {
  return { status: 100, body, headers }
}

export type SwitchingProtocols<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<101, Body, Headers>
export function switchingProtocols<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): SwitchingProtocols<Body, Headers>
export function switchingProtocols<Body>(
  body: Body
): SwitchingProtocols<Body, undefined>
export function switchingProtocols(): SwitchingProtocols<undefined, undefined>
export function switchingProtocols(body = undefined, headers = undefined) {
  return { status: 101, body, headers }
}

export type Processing<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<102, Body, Headers>
export function processing<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): Processing<Body, Headers>
export function processing<Body>(body: Body): Processing<Body, undefined>
export function processing(): Processing<undefined, undefined>
export function processing(body = undefined, headers = undefined) {
  return { status: 102, body, headers }
}

export type EarlyHints<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<103, Body, Headers>
export function earlyHints<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): EarlyHints<Body, Headers>
export function earlyHints<Body>(body: Body): EarlyHints<Body, undefined>
export function earlyHints(): EarlyHints<undefined, undefined>
export function earlyHints(body = undefined, headers = undefined) {
  return { status: 103, body, headers }
}

export type Ok<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<200, Body, Headers>
export function ok<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): Ok<Body, Headers>
export function ok<Body>(body: Body): Ok<Body, undefined>
export function ok(): Ok<undefined, undefined>
export function ok(body = undefined, headers = undefined) {
  return { status: 200, body, headers }
}

export type Created<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<201, Body, Headers>
export function created<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): Created<Body, Headers>
export function created<Body>(body: Body): Created<Body, undefined>
export function created(): Created<undefined, undefined>
export function created(body = undefined, headers = undefined) {
  return { status: 201, body, headers }
}

export type Accepted<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<202, Body, Headers>
export function accepted<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): Accepted<Body, Headers>
export function accepted<Body>(body: Body): Accepted<Body, undefined>
export function accepted(): Accepted<undefined, undefined>
export function accepted(body = undefined, headers = undefined) {
  return { status: 202, body, headers }
}

export type NonAuthoritativeInformation<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<203, Body, Headers>
export function nonAuthoritativeInformation<
  Body,
  Headers extends OptionalHeaders,
>(body: Body, headers: Headers): NonAuthoritativeInformation<Body, Headers>
export function nonAuthoritativeInformation<Body>(
  body: Body
): NonAuthoritativeInformation<Body, undefined>
export function nonAuthoritativeInformation(): NonAuthoritativeInformation<
  undefined,
  undefined
>
export function nonAuthoritativeInformation(
  body = undefined,
  headers = undefined
) {
  return { status: 203, body, headers }
}

export type NoContent<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<204, Body, Headers>
export function noContent<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): NoContent<Body, Headers>
export function noContent<Body>(body: Body): NoContent<Body, undefined>
export function noContent(): NoContent<undefined, undefined>
export function noContent(body = undefined, headers = undefined) {
  return { status: 204, body, headers }
}

export type ResetContent<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<205, Body, Headers>
export function resetContent<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): ResetContent<Body, Headers>
export function resetContent<Body>(body: Body): ResetContent<Body, undefined>
export function resetContent(): ResetContent<undefined, undefined>
export function resetContent(body = undefined, headers = undefined) {
  return { status: 205, body, headers }
}

export type PartialContent<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<206, Body, Headers>
export function partialContent<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): PartialContent<Body, Headers>
export function partialContent<Body>(
  body: Body
): PartialContent<Body, undefined>
export function partialContent(): PartialContent<undefined, undefined>
export function partialContent(body = undefined, headers = undefined) {
  return { status: 206, body, headers }
}

export type MultiStatus<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<207, Body, Headers>
export function multiStatus<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): MultiStatus<Body, Headers>
export function multiStatus<Body>(body: Body): MultiStatus<Body, undefined>
export function multiStatus(): MultiStatus<undefined, undefined>
export function multiStatus(body = undefined, headers = undefined) {
  return { status: 207, body, headers }
}

export type AlreadyReported<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<208, Body, Headers>
export function alreadyReported<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): AlreadyReported<Body, Headers>
export function alreadyReported<Body>(
  body: Body
): AlreadyReported<Body, undefined>
export function alreadyReported(): AlreadyReported<undefined, undefined>
export function alreadyReported(body = undefined, headers = undefined) {
  return { status: 208, body, headers }
}

export type IMUsed<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<226, Body, Headers>
export function iMUsed<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): IMUsed<Body, Headers>
export function iMUsed<Body>(body: Body): IMUsed<Body, undefined>
export function iMUsed(): IMUsed<undefined, undefined>
export function iMUsed(body = undefined, headers = undefined) {
  return { status: 226, body, headers }
}

export type MultipleChoices<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<300, Body, Headers>
export function multipleChoices<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): MultipleChoices<Body, Headers>
export function multipleChoices<Body>(
  body: Body
): MultipleChoices<Body, undefined>
export function multipleChoices(): MultipleChoices<undefined, undefined>
export function multipleChoices(body = undefined, headers = undefined) {
  return { status: 300, body, headers }
}

export type MovedPermanently<
  Body = string,
  Headers extends OptionalHeaders = { location: string },
> = Response<301, Body, Headers>
export function movedPermanently<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): MovedPermanently<Body, Headers>
export function movedPermanently<Body>(
  body: Body
): MovedPermanently<Body, undefined>
export function movedPermanently(): MovedPermanently<undefined, undefined>
export function movedPermanently(body = undefined, headers = undefined) {
  return { status: 301, body, headers }
}

export type Found<
  Body = string,
  Headers extends OptionalHeaders = { location: string },
> = Response<302, Body, Headers>
export function found<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): Found<Body, Headers>
export function found<Body>(body: Body): Found<Body, undefined>
export function found(): Found<undefined, undefined>
export function found(body = undefined, headers = undefined) {
  return { status: 302, body, headers }
}

export type SeeOther<
  Body = string,
  Headers extends OptionalHeaders = { location: string },
> = Response<303, Body, Headers>
export function seeOther<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): SeeOther<Body, Headers>
export function seeOther<Body>(body: Body): SeeOther<Body, undefined>
export function seeOther(): SeeOther<undefined, undefined>
export function seeOther(body = undefined, headers = undefined) {
  return { status: 303, body, headers }
}

export type NotModified<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<304, Body, Headers>
export function notModified<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): NotModified<Body, Headers>
export function notModified<Body>(body: Body): NotModified<Body, undefined>
export function notModified(): NotModified<undefined, undefined>
export function notModified(body = undefined, headers = undefined) {
  return { status: 304, body, headers }
}

export type UseProxy<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<305, Body, Headers>
export function useProxy<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): UseProxy<Body, Headers>
export function useProxy<Body>(body: Body): UseProxy<Body, undefined>
export function useProxy(): UseProxy<undefined, undefined>
export function useProxy(body = undefined, headers = undefined) {
  return { status: 305, body, headers }
}

export type SwitchProxy<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<306, Body, Headers>
export function switchProxy<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): SwitchProxy<Body, Headers>
export function switchProxy<Body>(body: Body): SwitchProxy<Body, undefined>
export function switchProxy(): SwitchProxy<undefined, undefined>
export function switchProxy(body = undefined, headers = undefined) {
  return { status: 306, body, headers }
}

export type TemporaryRedirect<
  Body = string,
  Headers extends OptionalHeaders = { location: string },
> = Response<307, Body, Headers>
export function temporaryRedirect<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): TemporaryRedirect<Body, Headers>
export function temporaryRedirect<Body>(
  body: Body
): TemporaryRedirect<Body, undefined>
export function temporaryRedirect(): TemporaryRedirect<undefined, undefined>
export function temporaryRedirect(body = undefined, headers = undefined) {
  return { status: 307, body, headers }
}

export type PermanentRedirect<
  Body = string,
  Headers extends OptionalHeaders = { location: string },
> = Response<308, Body, Headers>
export function permanentRedirect<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): PermanentRedirect<Body, Headers>
export function permanentRedirect<Body>(
  body: Body
): PermanentRedirect<Body, undefined>
export function permanentRedirect(): PermanentRedirect<undefined, undefined>
export function permanentRedirect(body = undefined, headers = undefined) {
  return { status: 308, body, headers }
}

export type BadRequest<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<400, Body, Headers>
export function badRequest<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): BadRequest<Body, Headers>
export function badRequest<Body>(body: Body): BadRequest<Body, undefined>
export function badRequest(): BadRequest<undefined, undefined>
export function badRequest(body = undefined, headers = undefined) {
  return { status: 400, body, headers }
}

export type Unauthorized<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<401, Body, Headers>
export function unauthorized<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): Unauthorized<Body, Headers>
export function unauthorized<Body>(body: Body): Unauthorized<Body, undefined>
export function unauthorized(): Unauthorized<undefined, undefined>
export function unauthorized(body = undefined, headers = undefined) {
  return { status: 401, body, headers }
}

export type PaymentRequired<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<402, Body, Headers>
export function paymentRequired<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): PaymentRequired<Body, Headers>
export function paymentRequired<Body>(
  body: Body
): PaymentRequired<Body, undefined>
export function paymentRequired(): PaymentRequired<undefined, undefined>
export function paymentRequired(body = undefined, headers = undefined) {
  return { status: 402, body, headers }
}

export type Forbidden<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<403, Body, Headers>
export function forbidden<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): Forbidden<Body, Headers>
export function forbidden<Body>(body: Body): Forbidden<Body, undefined>
export function forbidden(): Forbidden<undefined, undefined>
export function forbidden(body = undefined, headers = undefined) {
  return { status: 403, body, headers }
}

export type NotFound<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<404, Body, Headers>
export function notFound<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): NotFound<Body, Headers>
export function notFound<Body>(body: Body): NotFound<Body, undefined>
export function notFound(): NotFound<undefined, undefined>
export function notFound(body = undefined, headers = undefined) {
  return { status: 404, body, headers }
}

export type MethodNotAllowed<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<405, Body, Headers>
export function methodNotAllowed<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): MethodNotAllowed<Body, Headers>
export function methodNotAllowed<Body>(
  body: Body
): MethodNotAllowed<Body, undefined>
export function methodNotAllowed(): MethodNotAllowed<undefined, undefined>
export function methodNotAllowed(body = undefined, headers = undefined) {
  return { status: 405, body, headers }
}

export type NotAcceptable<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<406, Body, Headers>
export function notAcceptable<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): NotAcceptable<Body, Headers>
export function notAcceptable<Body>(body: Body): NotAcceptable<Body, undefined>
export function notAcceptable(): NotAcceptable<undefined, undefined>
export function notAcceptable(body = undefined, headers = undefined) {
  return { status: 406, body, headers }
}

export type ProxyAuthenticationRequired<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<407, Body, Headers>
export function proxyAuthenticationRequired<
  Body,
  Headers extends OptionalHeaders,
>(body: Body, headers: Headers): ProxyAuthenticationRequired<Body, Headers>
export function proxyAuthenticationRequired<Body>(
  body: Body
): ProxyAuthenticationRequired<Body, undefined>
export function proxyAuthenticationRequired(): ProxyAuthenticationRequired<
  undefined,
  undefined
>
export function proxyAuthenticationRequired(
  body = undefined,
  headers = undefined
) {
  return { status: 407, body, headers }
}

export type RequestTimeout<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<408, Body, Headers>
export function requestTimeout<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): RequestTimeout<Body, Headers>
export function requestTimeout<Body>(
  body: Body
): RequestTimeout<Body, undefined>
export function requestTimeout(): RequestTimeout<undefined, undefined>
export function requestTimeout(body = undefined, headers = undefined) {
  return { status: 408, body, headers }
}

export type Conflict<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<409, Body, Headers>
export function conflict<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): Conflict<Body, Headers>
export function conflict<Body>(body: Body): Conflict<Body, undefined>
export function conflict(): Conflict<undefined, undefined>
export function conflict(body = undefined, headers = undefined) {
  return { status: 409, body, headers }
}

export type Gone<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<410, Body, Headers>
export function gone<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): Gone<Body, Headers>
export function gone<Body>(body: Body): Gone<Body, undefined>
export function gone(): Gone<undefined, undefined>
export function gone(body = undefined, headers = undefined) {
  return { status: 410, body, headers }
}

export type LengthRequired<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<411, Body, Headers>
export function lengthRequired<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): LengthRequired<Body, Headers>
export function lengthRequired<Body>(
  body: Body
): LengthRequired<Body, undefined>
export function lengthRequired(): LengthRequired<undefined, undefined>
export function lengthRequired(body = undefined, headers = undefined) {
  return { status: 411, body, headers }
}

export type PreconditionFailed<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<412, Body, Headers>
export function preconditionFailed<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): PreconditionFailed<Body, Headers>
export function preconditionFailed<Body>(
  body: Body
): PreconditionFailed<Body, undefined>
export function preconditionFailed(): PreconditionFailed<undefined, undefined>
export function preconditionFailed(body = undefined, headers = undefined) {
  return { status: 412, body, headers }
}

export type PayloadTooLarge<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<413, Body, Headers>
export function payloadTooLarge<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): PayloadTooLarge<Body, Headers>
export function payloadTooLarge<Body>(
  body: Body
): PayloadTooLarge<Body, undefined>
export function payloadTooLarge(): PayloadTooLarge<undefined, undefined>
export function payloadTooLarge(body = undefined, headers = undefined) {
  return { status: 413, body, headers }
}

export type URITooLong<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<414, Body, Headers>
export function uRITooLong<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): URITooLong<Body, Headers>
export function uRITooLong<Body>(body: Body): URITooLong<Body, undefined>
export function uRITooLong(): URITooLong<undefined, undefined>
export function uRITooLong(body = undefined, headers = undefined) {
  return { status: 414, body, headers }
}

export type UnsupportedMediaType<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<415, Body, Headers>
export function unsupportedMediaType<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): UnsupportedMediaType<Body, Headers>
export function unsupportedMediaType<Body>(
  body: Body
): UnsupportedMediaType<Body, undefined>
export function unsupportedMediaType(): UnsupportedMediaType<
  undefined,
  undefined
>
export function unsupportedMediaType(body = undefined, headers = undefined) {
  return { status: 415, body, headers }
}

export type RangeNotSatisfiable<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<416, Body, Headers>
export function rangeNotSatisfiable<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): RangeNotSatisfiable<Body, Headers>
export function rangeNotSatisfiable<Body>(
  body: Body
): RangeNotSatisfiable<Body, undefined>
export function rangeNotSatisfiable(): RangeNotSatisfiable<undefined, undefined>
export function rangeNotSatisfiable(body = undefined, headers = undefined) {
  return { status: 416, body, headers }
}

export type ExpectationFailed<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<417, Body, Headers>
export function expectationFailed<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): ExpectationFailed<Body, Headers>
export function expectationFailed<Body>(
  body: Body
): ExpectationFailed<Body, undefined>
export function expectationFailed(): ExpectationFailed<undefined, undefined>
export function expectationFailed(body = undefined, headers = undefined) {
  return { status: 417, body, headers }
}

export type ImATeapot<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<418, Body, Headers>
export function imATeapot<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): ImATeapot<Body, Headers>
export function imATeapot<Body>(body: Body): ImATeapot<Body, undefined>
export function imATeapot(): ImATeapot<undefined, undefined>
export function imATeapot(body = undefined, headers = undefined) {
  return { status: 418, body, headers }
}

export type MisdirectedRequest<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<421, Body, Headers>
export function misdirectedRequest<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): MisdirectedRequest<Body, Headers>
export function misdirectedRequest<Body>(
  body: Body
): MisdirectedRequest<Body, undefined>
export function misdirectedRequest(): MisdirectedRequest<undefined, undefined>
export function misdirectedRequest(body = undefined, headers = undefined) {
  return { status: 421, body, headers }
}

export type UnprocessableEntity<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<422, Body, Headers>
export function unprocessableEntity<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): UnprocessableEntity<Body, Headers>
export function unprocessableEntity<Body>(
  body: Body
): UnprocessableEntity<Body, undefined>
export function unprocessableEntity(): UnprocessableEntity<undefined, undefined>
export function unprocessableEntity(body = undefined, headers = undefined) {
  return { status: 422, body, headers }
}

export type Locked<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<423, Body, Headers>
export function locked<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): Locked<Body, Headers>
export function locked<Body>(body: Body): Locked<Body, undefined>
export function locked(): Locked<undefined, undefined>
export function locked(body = undefined, headers = undefined) {
  return { status: 423, body, headers }
}

export type FailedDependency<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<424, Body, Headers>
export function failedDependency<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): FailedDependency<Body, Headers>
export function failedDependency<Body>(
  body: Body
): FailedDependency<Body, undefined>
export function failedDependency(): FailedDependency<undefined, undefined>
export function failedDependency(body = undefined, headers = undefined) {
  return { status: 424, body, headers }
}

export type TooEarly<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<425, Body, Headers>
export function tooEarly<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): TooEarly<Body, Headers>
export function tooEarly<Body>(body: Body): TooEarly<Body, undefined>
export function tooEarly(): TooEarly<undefined, undefined>
export function tooEarly(body = undefined, headers = undefined) {
  return { status: 425, body, headers }
}

export type UpgradeRequired<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<426, Body, Headers>
export function upgradeRequired<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): UpgradeRequired<Body, Headers>
export function upgradeRequired<Body>(
  body: Body
): UpgradeRequired<Body, undefined>
export function upgradeRequired(): UpgradeRequired<undefined, undefined>
export function upgradeRequired(body = undefined, headers = undefined) {
  return { status: 426, body, headers }
}

export type PreconditionRequired<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<428, Body, Headers>
export function preconditionRequired<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): PreconditionRequired<Body, Headers>
export function preconditionRequired<Body>(
  body: Body
): PreconditionRequired<Body, undefined>
export function preconditionRequired(): PreconditionRequired<
  undefined,
  undefined
>
export function preconditionRequired(body = undefined, headers = undefined) {
  return { status: 428, body, headers }
}

export type TooManyRequests<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<429, Body, Headers>
export function tooManyRequests<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): TooManyRequests<Body, Headers>
export function tooManyRequests<Body>(
  body: Body
): TooManyRequests<Body, undefined>
export function tooManyRequests(): TooManyRequests<undefined, undefined>
export function tooManyRequests(body = undefined, headers = undefined) {
  return { status: 429, body, headers }
}

export type RequestHeaderFieldsTooLarge<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<431, Body, Headers>
export function requestHeaderFieldsTooLarge<
  Body,
  Headers extends OptionalHeaders,
>(body: Body, headers: Headers): RequestHeaderFieldsTooLarge<Body, Headers>
export function requestHeaderFieldsTooLarge<Body>(
  body: Body
): RequestHeaderFieldsTooLarge<Body, undefined>
export function requestHeaderFieldsTooLarge(): RequestHeaderFieldsTooLarge<
  undefined,
  undefined
>
export function requestHeaderFieldsTooLarge(
  body = undefined,
  headers = undefined
) {
  return { status: 431, body, headers }
}

export type UnavailableForLegalReasons<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<451, Body, Headers>
export function unavailableForLegalReasons<
  Body,
  Headers extends OptionalHeaders,
>(body: Body, headers: Headers): UnavailableForLegalReasons<Body, Headers>
export function unavailableForLegalReasons<Body>(
  body: Body
): UnavailableForLegalReasons<Body, undefined>
export function unavailableForLegalReasons(): UnavailableForLegalReasons<
  undefined,
  undefined
>
export function unavailableForLegalReasons(
  body = undefined,
  headers = undefined
) {
  return { status: 451, body, headers }
}

export type InternalServerError<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<500, Body, Headers>
export function internalServerError<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): InternalServerError<Body, Headers>
export function internalServerError<Body>(
  body: Body
): InternalServerError<Body, undefined>
export function internalServerError(): InternalServerError<undefined, undefined>
export function internalServerError(body = undefined, headers = undefined) {
  return { status: 500, body, headers }
}

export type NotImplemented<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<501, Body, Headers>
export function notImplemented<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): NotImplemented<Body, Headers>
export function notImplemented<Body>(
  body: Body
): NotImplemented<Body, undefined>
export function notImplemented(): NotImplemented<undefined, undefined>
export function notImplemented(body = undefined, headers = undefined) {
  return { status: 501, body, headers }
}

export type BadGateway<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<502, Body, Headers>
export function badGateway<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): BadGateway<Body, Headers>
export function badGateway<Body>(body: Body): BadGateway<Body, undefined>
export function badGateway(): BadGateway<undefined, undefined>
export function badGateway(body = undefined, headers = undefined) {
  return { status: 502, body, headers }
}

export type ServiceUnavailable<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<503, Body, Headers>
export function serviceUnavailable<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): ServiceUnavailable<Body, Headers>
export function serviceUnavailable<Body>(
  body: Body
): ServiceUnavailable<Body, undefined>
export function serviceUnavailable(): ServiceUnavailable<undefined, undefined>
export function serviceUnavailable(body = undefined, headers = undefined) {
  return { status: 503, body, headers }
}

export type GatewayTimeout<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<504, Body, Headers>
export function gatewayTimeout<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): GatewayTimeout<Body, Headers>
export function gatewayTimeout<Body>(
  body: Body
): GatewayTimeout<Body, undefined>
export function gatewayTimeout(): GatewayTimeout<undefined, undefined>
export function gatewayTimeout(body = undefined, headers = undefined) {
  return { status: 504, body, headers }
}

export type HTTPVersionNotSupported<
  Body = undefined,
  Headers extends OptionalHeaders = undefined,
> = Response<505, Body, Headers>
export function hTTPVersionNotSupported<Body, Headers extends OptionalHeaders>(
  body: Body,
  headers: Headers
): HTTPVersionNotSupported<Body, Headers>
export function hTTPVersionNotSupported<Body>(
  body: Body
): HTTPVersionNotSupported<Body, undefined>
export function hTTPVersionNotSupported(): HTTPVersionNotSupported<
  undefined,
  undefined
>
export function hTTPVersionNotSupported(body = undefined, headers = undefined) {
  return { status: 505, body, headers }
}

type RedirectStatus = 301 | 302 | 303 | 307 | 308

function redirectName(status: RedirectStatus): string {
  switch (status) {
    case 301:
      return 'Moved permanently'
    case 302:
      return 'Found'
    case 303:
      return 'See other'
    case 307:
      return 'Temporary redirect'
    case 308:
      return 'Permanent redirect'
  }
}

export function redirect<Status extends RedirectStatus>(
  status: Status,
  location: string
): Response<Status, string, { location: string }> {
  return {
    status,
    body: `${redirectName(status)}. Redirecting to ${location}`,
    headers: { location },
  }
}

export type StreamingBodyCallback = (stream: Writable) => void

export type StreamingBody = {
  _kind: 'StreamingBody'
  callback: StreamingBodyCallback
}

export function streamingBody(callback: StreamingBodyCallback): StreamingBody {
  return { _kind: 'StreamingBody', callback }
}

export function isStreamingBody(body: any): body is StreamingBody {
  return body && body._kind === 'StreamingBody' && body.callback
}
