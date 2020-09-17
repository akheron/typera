import * as koa from 'koa'

export interface RequestBase {
  ctx: koa.Context
}

export function getRouteParams(req: RequestBase): any {
  return req.ctx.params
}
