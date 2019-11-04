import * as koa from 'koa'
import * as commonParser from 'typera-common/parser'
import * as commonResponse from 'typera-common/response'
import { getRouteParams } from './context'

export type ErrorHandler<
  ErrorResponse extends commonResponse.Generic
> = commonParser.ErrorHandler<ErrorResponse>

function getBody(ctx: koa.Context): any {
  return ctx.request.body
}
export const bodyP = commonParser.bodyP(getBody)
export const body = commonParser.body(getBody)

export const routeParamsP = commonParser.routeParamsP(getRouteParams)
export const routeParams = commonParser.routeParams(getRouteParams)

function getQuery(ctx: koa.Context): any {
  return ctx.request.query
}
export const queryP = commonParser.queryP(getQuery)
export const query = commonParser.query(getQuery)

function getHeaders(ctx: koa.Context): any {
  return ctx.request.headers
}
export const headersP = commonParser.headersP(getHeaders)
export const headers = commonParser.headers(getHeaders)
