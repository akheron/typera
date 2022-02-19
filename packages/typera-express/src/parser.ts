import * as commonParser from 'typera-common/parser'
import * as commonResponse from 'typera-common/response'
import { RequestBase } from './context'

export type ErrorHandler<ErrorResponse extends commonResponse.Generic> =
  commonParser.ErrorHandler<ErrorResponse>

function getBody(e: RequestBase): any {
  return e.req.body
}
export const bodyP = commonParser.bodyP(getBody)
export const body = commonParser.body(getBody)

function getQuery(e: RequestBase): any {
  return e.req.query
}
export const queryP = commonParser.queryP(getQuery)
export const query = commonParser.query(getQuery)

function getHeaders(e: RequestBase): any {
  return new Proxy(e.req, {
    get: (target, field) =>
      typeof field === 'string' ? target.get(field) : undefined,
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      }
    },
    ownKeys: (target) => Object.keys(target.headers),
  })
}
export const headersP = commonParser.headersP(getHeaders)
export const headers = commonParser.headers(getHeaders)

function getCookies(e: RequestBase): any {
  return e.req.cookies
}
export const cookiesP = commonParser.cookiesP(getCookies)
export const cookies = commonParser.cookies(getCookies)
