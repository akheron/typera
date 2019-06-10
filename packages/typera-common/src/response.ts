namespace Response {
  export type Response<Status, Body> = {
    status: Status
    body: Body
  }

  export type Generic = Response<number, any>
  export type Ok<Body = undefined> = Response<200, Body>
  export type Created<Body = undefined> = Response<201, Body>
  export type NoContent = Response<204, undefined>
  export type BadRequest<Body = undefined> = Response<400, Body>
  export type NotFound<Body = undefined> = Response<404, Body>

  export function ok<Body>(body: Body): Ok<Body>
  export function ok(): Ok
  export function ok(body = undefined) {
    return { status: 200, body }
  }

  export function created<Body>(body: Body): Created<Body>
  export function created<Body>(): Created
  export function created(body = undefined) {
    return { status: 201, body }
  }

  export function noContent(): NoContent {
    return { status: 204, body: undefined }
  }

  export function badRequest<Body>(body: Body): BadRequest<Body>
  export function badRequest<Body>(): BadRequest
  export function badRequest(body = undefined) {
    return { status: 400, body }
  }

  export function notFound<Body>(body: Body): NotFound<Body>
  export function notFound(): NotFound
  export function notFound(body = undefined) {
    return { status: 404, body }
  }
}

export default Response
