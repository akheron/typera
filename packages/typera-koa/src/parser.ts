import * as commonParser from 'typera-common/parser'
import * as commonResponse from 'typera-common/response'
import { RequestBase } from './context'

export type ErrorHandler<
  ErrorResponse extends commonResponse.Generic
> = commonParser.ErrorHandler<ErrorResponse>

function getBody(req: RequestBase): any {
  return req.ctx.request.body
}
export const bodyP = commonParser.bodyP(getBody)
export const body = commonParser.body(getBody)

function getQuery(req: RequestBase): any {
  return req.ctx.request.query
}
export const queryP = commonParser.queryP(getQuery)
export const query = commonParser.query(getQuery)

function getHeaders(req: RequestBase): any {
  return req.ctx.request.headers
}
export const headersP = commonParser.headersP(getHeaders)
export const headers = commonParser.headers(getHeaders)

function getCookies(req: RequestBase): any {
  // koa doesn't provide a way to read all cookies into an object, so we have to
  // parse the names from the Cookie header
  //
  // It would be more efficient to look up the expected cookie names from
  // the io-ts codec, though.
  //
  const cookieHeader = req.ctx.get('cookie') ?? ''
  const cookieNames = [...cookieHeader.matchAll(/(.*?)=.*?(?:$|; )/g)].map(
    (match) => match[1]
  )
  return Object.fromEntries(
    cookieNames.map((name) => [name, req.ctx.cookies.get(name)])
  )
}
export const cookiesP = commonParser.cookiesP(getCookies)
export const cookies = commonParser.cookies(getCookies)
