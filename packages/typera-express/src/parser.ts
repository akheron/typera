import * as commonParser from 'typera-common/parser'
import * as commonResponse from 'typera-common/response'
import { ExpressContext, getRouteParams } from './context'

export type ErrorHandler<
  ErrorResponse extends commonResponse.Generic
> = commonParser.ErrorHandler<ErrorResponse>

function getBody(e: ExpressContext): any {
  return e.req.body
}
export const bodyP = commonParser.bodyP(getBody)
export const body = commonParser.body(getBody)

export const routeParamsP = commonParser.routeParamsP(getRouteParams)
export const routeParams = commonParser.routeParams(getRouteParams)

function getQuery(e: ExpressContext): any {
  return e.req.query
}
export const queryP = commonParser.queryP(getQuery)
export const query = commonParser.query(getQuery)

function getHeaders(e: ExpressContext): any {
  return e.req.headers
}
export const headersP = commonParser.headersP(getHeaders)
export const headers = commonParser.headers(getHeaders)
