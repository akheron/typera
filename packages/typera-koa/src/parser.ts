import * as commonParser from 'typera-common/parser'
import * as commonResponse from 'typera-common/response'
import { getRouteParams, KoaRequestBase } from './context'

export type ErrorHandler<
  ErrorResponse extends commonResponse.Generic
> = commonParser.ErrorHandler<ErrorResponse>

function getBody(req: KoaRequestBase): any {
  return req.ctx.request.body
}
export const bodyP = commonParser.bodyP(getBody)
export const body = commonParser.body(getBody)

export const routeParamsP = commonParser.routeParamsP(getRouteParams)
export const routeParams = commonParser.routeParams(getRouteParams)

function getQuery(req: KoaRequestBase): any {
  return req.ctx.request.query
}
export const queryP = commonParser.queryP(getQuery)
export const query = commonParser.query(getQuery)

function getHeaders(req: KoaRequestBase): any {
  return req.ctx.request.headers
}
export const headersP = commonParser.headersP(getHeaders)
export const headers = commonParser.headers(getHeaders)
