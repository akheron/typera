export namespace Response {
  export type Response<ResponseStatus, ResponseBody> = {
    status: ResponseStatus
    body: ResponseBody
  }

  export type Generic = Response<number, any>
  export type Ok<ResponseBody = undefined> = Response<200, ResponseBody>
  export type Created<ResponseBody = undefined> = Response<201, ResponseBody>
  export type NoContent = Response<204, undefined>
  export type BadRequest<ResponseBody = undefined> = Response<400, ResponseBody>
  export type NotFound<ResponseBody = undefined> = Response<404, ResponseBody>

  export const ok = <ResponseBody>(body: ResponseBody): Ok<ResponseBody> => ({
    status: 200,
    body,
  })

  export const created = <ResponseBody>(
    body: ResponseBody
  ): Created<ResponseBody> => ({
    status: 201,
    body,
  })

  export const noContent = (): NoContent => ({ status: 204, body: undefined })

  export const badRequest = <ResponseBody>(
    body: ResponseBody
  ): BadRequest<ResponseBody> => ({ status: 400, body })

  export const notFound = <ResponseBody>(
    body: ResponseBody
  ): NotFound<ResponseBody> => ({ status: 404, body })
}
