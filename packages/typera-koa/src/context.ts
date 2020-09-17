import * as koa from 'koa'

export interface KoaRequestBase {
  ctx: koa.Context
}

export function getRouteParams(req: KoaRequestBase): any {
  return req.ctx.params
}
