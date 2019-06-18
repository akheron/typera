// This file is generated, do not edit! See ../tools/generate-responses.ts

namespace Response {
  type OptionalHeaders = { [key: string]: string } | undefined

  export type Response<Status, Body, Headers extends OptionalHeaders> = {
    status: Status
    body: Body
    headers: Headers
  }

  export type Generic = Response<number, any, any>

  export type Continue<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<100, Body, Headers>
  export function continue_<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): Continue<Body, Headers>
  export function continue_<Body>(body: Body): Continue<Body>
  export function continue_(): Continue
  export function continue_(body = undefined, headers = undefined) {
    return { status: 100, body, headers }
  }

  export type SwitchingProtocols<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<101, Body, Headers>
  export function switchingProtocols<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): SwitchingProtocols<Body, Headers>
  export function switchingProtocols<Body>(body: Body): SwitchingProtocols<Body>
  export function switchingProtocols(): SwitchingProtocols
  export function switchingProtocols(body = undefined, headers = undefined) {
    return { status: 101, body, headers }
  }

  export type Processing<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<102, Body, Headers>
  export function processing<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): Processing<Body, Headers>
  export function processing<Body>(body: Body): Processing<Body>
  export function processing(): Processing
  export function processing(body = undefined, headers = undefined) {
    return { status: 102, body, headers }
  }

  export type EarlyHints<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<103, Body, Headers>
  export function earlyHints<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): EarlyHints<Body, Headers>
  export function earlyHints<Body>(body: Body): EarlyHints<Body>
  export function earlyHints(): EarlyHints
  export function earlyHints(body = undefined, headers = undefined) {
    return { status: 103, body, headers }
  }

  export type Ok<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<200, Body, Headers>
  export function ok<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): Ok<Body, Headers>
  export function ok<Body>(body: Body): Ok<Body>
  export function ok(): Ok
  export function ok(body = undefined, headers = undefined) {
    return { status: 200, body, headers }
  }

  export type Created<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<201, Body, Headers>
  export function created<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): Created<Body, Headers>
  export function created<Body>(body: Body): Created<Body>
  export function created(): Created
  export function created(body = undefined, headers = undefined) {
    return { status: 201, body, headers }
  }

  export type Accepted<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<202, Body, Headers>
  export function accepted<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): Accepted<Body, Headers>
  export function accepted<Body>(body: Body): Accepted<Body>
  export function accepted(): Accepted
  export function accepted(body = undefined, headers = undefined) {
    return { status: 202, body, headers }
  }

  export type NonAuthoritativeInformation<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<203, Body, Headers>
  export function nonAuthoritativeInformation<
    Body,
    Headers extends OptionalHeaders
  >(body: Body, headers: Headers): NonAuthoritativeInformation<Body, Headers>
  export function nonAuthoritativeInformation<Body>(
    body: Body
  ): NonAuthoritativeInformation<Body>
  export function nonAuthoritativeInformation(): NonAuthoritativeInformation
  export function nonAuthoritativeInformation(
    body = undefined,
    headers = undefined
  ) {
    return { status: 203, body, headers }
  }

  export type NoContent<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<204, Body, Headers>
  export function noContent<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): NoContent<Body, Headers>
  export function noContent<Body>(body: Body): NoContent<Body>
  export function noContent(): NoContent
  export function noContent(body = undefined, headers = undefined) {
    return { status: 204, body, headers }
  }

  export type ResetContent<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<205, Body, Headers>
  export function resetContent<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): ResetContent<Body, Headers>
  export function resetContent<Body>(body: Body): ResetContent<Body>
  export function resetContent(): ResetContent
  export function resetContent(body = undefined, headers = undefined) {
    return { status: 205, body, headers }
  }

  export type PartialContent<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<206, Body, Headers>
  export function partialContent<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): PartialContent<Body, Headers>
  export function partialContent<Body>(body: Body): PartialContent<Body>
  export function partialContent(): PartialContent
  export function partialContent(body = undefined, headers = undefined) {
    return { status: 206, body, headers }
  }

  export type MultiStatus<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<207, Body, Headers>
  export function multiStatus<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): MultiStatus<Body, Headers>
  export function multiStatus<Body>(body: Body): MultiStatus<Body>
  export function multiStatus(): MultiStatus
  export function multiStatus(body = undefined, headers = undefined) {
    return { status: 207, body, headers }
  }

  export type AlreadyReported<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<208, Body, Headers>
  export function alreadyReported<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): AlreadyReported<Body, Headers>
  export function alreadyReported<Body>(body: Body): AlreadyReported<Body>
  export function alreadyReported(): AlreadyReported
  export function alreadyReported(body = undefined, headers = undefined) {
    return { status: 208, body, headers }
  }

  export type IMUsed<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<226, Body, Headers>
  export function iMUsed<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): IMUsed<Body, Headers>
  export function iMUsed<Body>(body: Body): IMUsed<Body>
  export function iMUsed(): IMUsed
  export function iMUsed(body = undefined, headers = undefined) {
    return { status: 226, body, headers }
  }

  export type MultipleChoices<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<300, Body, Headers>
  export function multipleChoices<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): MultipleChoices<Body, Headers>
  export function multipleChoices<Body>(body: Body): MultipleChoices<Body>
  export function multipleChoices(): MultipleChoices
  export function multipleChoices(body = undefined, headers = undefined) {
    return { status: 300, body, headers }
  }

  export type MovedPermanently<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<301, Body, Headers>
  export function movedPermanently<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): MovedPermanently<Body, Headers>
  export function movedPermanently<Body>(body: Body): MovedPermanently<Body>
  export function movedPermanently(): MovedPermanently
  export function movedPermanently(body = undefined, headers = undefined) {
    return { status: 301, body, headers }
  }

  export type Found<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<302, Body, Headers>
  export function found<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): Found<Body, Headers>
  export function found<Body>(body: Body): Found<Body>
  export function found(): Found
  export function found(body = undefined, headers = undefined) {
    return { status: 302, body, headers }
  }

  export type SeeOther<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<303, Body, Headers>
  export function seeOther<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): SeeOther<Body, Headers>
  export function seeOther<Body>(body: Body): SeeOther<Body>
  export function seeOther(): SeeOther
  export function seeOther(body = undefined, headers = undefined) {
    return { status: 303, body, headers }
  }

  export type NotModified<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<304, Body, Headers>
  export function notModified<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): NotModified<Body, Headers>
  export function notModified<Body>(body: Body): NotModified<Body>
  export function notModified(): NotModified
  export function notModified(body = undefined, headers = undefined) {
    return { status: 304, body, headers }
  }

  export type UseProxy<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<305, Body, Headers>
  export function useProxy<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): UseProxy<Body, Headers>
  export function useProxy<Body>(body: Body): UseProxy<Body>
  export function useProxy(): UseProxy
  export function useProxy(body = undefined, headers = undefined) {
    return { status: 305, body, headers }
  }

  export type SwitchProxy<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<306, Body, Headers>
  export function switchProxy<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): SwitchProxy<Body, Headers>
  export function switchProxy<Body>(body: Body): SwitchProxy<Body>
  export function switchProxy(): SwitchProxy
  export function switchProxy(body = undefined, headers = undefined) {
    return { status: 306, body, headers }
  }

  export type TemporaryRedirect<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<307, Body, Headers>
  export function temporaryRedirect<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): TemporaryRedirect<Body, Headers>
  export function temporaryRedirect<Body>(body: Body): TemporaryRedirect<Body>
  export function temporaryRedirect(): TemporaryRedirect
  export function temporaryRedirect(body = undefined, headers = undefined) {
    return { status: 307, body, headers }
  }

  export type PermanentRedirect<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<308, Body, Headers>
  export function permanentRedirect<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): PermanentRedirect<Body, Headers>
  export function permanentRedirect<Body>(body: Body): PermanentRedirect<Body>
  export function permanentRedirect(): PermanentRedirect
  export function permanentRedirect(body = undefined, headers = undefined) {
    return { status: 308, body, headers }
  }

  export type BadRequest<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<400, Body, Headers>
  export function badRequest<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): BadRequest<Body, Headers>
  export function badRequest<Body>(body: Body): BadRequest<Body>
  export function badRequest(): BadRequest
  export function badRequest(body = undefined, headers = undefined) {
    return { status: 400, body, headers }
  }

  export type Unauthorized<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<401, Body, Headers>
  export function unauthorized<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): Unauthorized<Body, Headers>
  export function unauthorized<Body>(body: Body): Unauthorized<Body>
  export function unauthorized(): Unauthorized
  export function unauthorized(body = undefined, headers = undefined) {
    return { status: 401, body, headers }
  }

  export type PaymentRequired<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<402, Body, Headers>
  export function paymentRequired<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): PaymentRequired<Body, Headers>
  export function paymentRequired<Body>(body: Body): PaymentRequired<Body>
  export function paymentRequired(): PaymentRequired
  export function paymentRequired(body = undefined, headers = undefined) {
    return { status: 402, body, headers }
  }

  export type Forbidden<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<403, Body, Headers>
  export function forbidden<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): Forbidden<Body, Headers>
  export function forbidden<Body>(body: Body): Forbidden<Body>
  export function forbidden(): Forbidden
  export function forbidden(body = undefined, headers = undefined) {
    return { status: 403, body, headers }
  }

  export type NotFound<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<404, Body, Headers>
  export function notFound<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): NotFound<Body, Headers>
  export function notFound<Body>(body: Body): NotFound<Body>
  export function notFound(): NotFound
  export function notFound(body = undefined, headers = undefined) {
    return { status: 404, body, headers }
  }

  export type MethodNotAllowed<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<405, Body, Headers>
  export function methodNotAllowed<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): MethodNotAllowed<Body, Headers>
  export function methodNotAllowed<Body>(body: Body): MethodNotAllowed<Body>
  export function methodNotAllowed(): MethodNotAllowed
  export function methodNotAllowed(body = undefined, headers = undefined) {
    return { status: 405, body, headers }
  }

  export type NotAcceptable<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<406, Body, Headers>
  export function notAcceptable<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): NotAcceptable<Body, Headers>
  export function notAcceptable<Body>(body: Body): NotAcceptable<Body>
  export function notAcceptable(): NotAcceptable
  export function notAcceptable(body = undefined, headers = undefined) {
    return { status: 406, body, headers }
  }

  export type ProxyAuthenticationRequired<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<407, Body, Headers>
  export function proxyAuthenticationRequired<
    Body,
    Headers extends OptionalHeaders
  >(body: Body, headers: Headers): ProxyAuthenticationRequired<Body, Headers>
  export function proxyAuthenticationRequired<Body>(
    body: Body
  ): ProxyAuthenticationRequired<Body>
  export function proxyAuthenticationRequired(): ProxyAuthenticationRequired
  export function proxyAuthenticationRequired(
    body = undefined,
    headers = undefined
  ) {
    return { status: 407, body, headers }
  }

  export type RequestTimeout<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<408, Body, Headers>
  export function requestTimeout<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): RequestTimeout<Body, Headers>
  export function requestTimeout<Body>(body: Body): RequestTimeout<Body>
  export function requestTimeout(): RequestTimeout
  export function requestTimeout(body = undefined, headers = undefined) {
    return { status: 408, body, headers }
  }

  export type Conflict<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<409, Body, Headers>
  export function conflict<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): Conflict<Body, Headers>
  export function conflict<Body>(body: Body): Conflict<Body>
  export function conflict(): Conflict
  export function conflict(body = undefined, headers = undefined) {
    return { status: 409, body, headers }
  }

  export type Gone<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<410, Body, Headers>
  export function gone<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): Gone<Body, Headers>
  export function gone<Body>(body: Body): Gone<Body>
  export function gone(): Gone
  export function gone(body = undefined, headers = undefined) {
    return { status: 410, body, headers }
  }

  export type LengthRequired<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<411, Body, Headers>
  export function lengthRequired<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): LengthRequired<Body, Headers>
  export function lengthRequired<Body>(body: Body): LengthRequired<Body>
  export function lengthRequired(): LengthRequired
  export function lengthRequired(body = undefined, headers = undefined) {
    return { status: 411, body, headers }
  }

  export type PreconditionFailed<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<412, Body, Headers>
  export function preconditionFailed<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): PreconditionFailed<Body, Headers>
  export function preconditionFailed<Body>(body: Body): PreconditionFailed<Body>
  export function preconditionFailed(): PreconditionFailed
  export function preconditionFailed(body = undefined, headers = undefined) {
    return { status: 412, body, headers }
  }

  export type PayloadTooLarge<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<413, Body, Headers>
  export function payloadTooLarge<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): PayloadTooLarge<Body, Headers>
  export function payloadTooLarge<Body>(body: Body): PayloadTooLarge<Body>
  export function payloadTooLarge(): PayloadTooLarge
  export function payloadTooLarge(body = undefined, headers = undefined) {
    return { status: 413, body, headers }
  }

  export type URITooLong<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<414, Body, Headers>
  export function uRITooLong<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): URITooLong<Body, Headers>
  export function uRITooLong<Body>(body: Body): URITooLong<Body>
  export function uRITooLong(): URITooLong
  export function uRITooLong(body = undefined, headers = undefined) {
    return { status: 414, body, headers }
  }

  export type UnsupportedMediaType<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<415, Body, Headers>
  export function unsupportedMediaType<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): UnsupportedMediaType<Body, Headers>
  export function unsupportedMediaType<Body>(
    body: Body
  ): UnsupportedMediaType<Body>
  export function unsupportedMediaType(): UnsupportedMediaType
  export function unsupportedMediaType(body = undefined, headers = undefined) {
    return { status: 415, body, headers }
  }

  export type RangeNotSatisfiable<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<416, Body, Headers>
  export function rangeNotSatisfiable<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): RangeNotSatisfiable<Body, Headers>
  export function rangeNotSatisfiable<Body>(
    body: Body
  ): RangeNotSatisfiable<Body>
  export function rangeNotSatisfiable(): RangeNotSatisfiable
  export function rangeNotSatisfiable(body = undefined, headers = undefined) {
    return { status: 416, body, headers }
  }

  export type ExpectationFailed<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<417, Body, Headers>
  export function expectationFailed<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): ExpectationFailed<Body, Headers>
  export function expectationFailed<Body>(body: Body): ExpectationFailed<Body>
  export function expectationFailed(): ExpectationFailed
  export function expectationFailed(body = undefined, headers = undefined) {
    return { status: 417, body, headers }
  }

  export type ImATeapot<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<418, Body, Headers>
  export function imATeapot<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): ImATeapot<Body, Headers>
  export function imATeapot<Body>(body: Body): ImATeapot<Body>
  export function imATeapot(): ImATeapot
  export function imATeapot(body = undefined, headers = undefined) {
    return { status: 418, body, headers }
  }

  export type MisdirectedRequest<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<421, Body, Headers>
  export function misdirectedRequest<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): MisdirectedRequest<Body, Headers>
  export function misdirectedRequest<Body>(body: Body): MisdirectedRequest<Body>
  export function misdirectedRequest(): MisdirectedRequest
  export function misdirectedRequest(body = undefined, headers = undefined) {
    return { status: 421, body, headers }
  }

  export type UnprocessableEntity<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<422, Body, Headers>
  export function unprocessableEntity<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): UnprocessableEntity<Body, Headers>
  export function unprocessableEntity<Body>(
    body: Body
  ): UnprocessableEntity<Body>
  export function unprocessableEntity(): UnprocessableEntity
  export function unprocessableEntity(body = undefined, headers = undefined) {
    return { status: 422, body, headers }
  }

  export type Locked<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<423, Body, Headers>
  export function locked<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): Locked<Body, Headers>
  export function locked<Body>(body: Body): Locked<Body>
  export function locked(): Locked
  export function locked(body = undefined, headers = undefined) {
    return { status: 423, body, headers }
  }

  export type FailedDependency<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<424, Body, Headers>
  export function failedDependency<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): FailedDependency<Body, Headers>
  export function failedDependency<Body>(body: Body): FailedDependency<Body>
  export function failedDependency(): FailedDependency
  export function failedDependency(body = undefined, headers = undefined) {
    return { status: 424, body, headers }
  }

  export type TooEarly<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<425, Body, Headers>
  export function tooEarly<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): TooEarly<Body, Headers>
  export function tooEarly<Body>(body: Body): TooEarly<Body>
  export function tooEarly(): TooEarly
  export function tooEarly(body = undefined, headers = undefined) {
    return { status: 425, body, headers }
  }

  export type UpgradeRequired<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<426, Body, Headers>
  export function upgradeRequired<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): UpgradeRequired<Body, Headers>
  export function upgradeRequired<Body>(body: Body): UpgradeRequired<Body>
  export function upgradeRequired(): UpgradeRequired
  export function upgradeRequired(body = undefined, headers = undefined) {
    return { status: 426, body, headers }
  }

  export type PreconditionRequired<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<428, Body, Headers>
  export function preconditionRequired<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): PreconditionRequired<Body, Headers>
  export function preconditionRequired<Body>(
    body: Body
  ): PreconditionRequired<Body>
  export function preconditionRequired(): PreconditionRequired
  export function preconditionRequired(body = undefined, headers = undefined) {
    return { status: 428, body, headers }
  }

  export type TooManyRequests<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<429, Body, Headers>
  export function tooManyRequests<Body, Headers extends OptionalHeaders>(
    body: Body,
    headers: Headers
  ): TooManyRequests<Body, Headers>
  export function tooManyRequests<Body>(body: Body): TooManyRequests<Body>
  export function tooManyRequests(): TooManyRequests
  export function tooManyRequests(body = undefined, headers = undefined) {
    return { status: 429, body, headers }
  }

  export type RequestHeaderFieldsTooLarge<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<431, Body, Headers>
  export function requestHeaderFieldsTooLarge<
    Body,
    Headers extends OptionalHeaders
  >(body: Body, headers: Headers): RequestHeaderFieldsTooLarge<Body, Headers>
  export function requestHeaderFieldsTooLarge<Body>(
    body: Body
  ): RequestHeaderFieldsTooLarge<Body>
  export function requestHeaderFieldsTooLarge(): RequestHeaderFieldsTooLarge
  export function requestHeaderFieldsTooLarge(
    body = undefined,
    headers = undefined
  ) {
    return { status: 431, body, headers }
  }

  export type UnavailableForLegalReasons<
    Body = undefined,
    Headers extends OptionalHeaders = undefined
  > = Response<451, Body, Headers>
  export function unavailableForLegalReasons<
    Body,
    Headers extends OptionalHeaders
  >(body: Body, headers: Headers): UnavailableForLegalReasons<Body, Headers>
  export function unavailableForLegalReasons<Body>(
    body: Body
  ): UnavailableForLegalReasons<Body>
  export function unavailableForLegalReasons(): UnavailableForLegalReasons
  export function unavailableForLegalReasons(
    body = undefined,
    headers = undefined
  ) {
    return { status: 451, body, headers }
  }
}

export default Response
