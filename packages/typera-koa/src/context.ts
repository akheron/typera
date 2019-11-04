import * as koa from 'koa'

export function getRouteParams(ctx: koa.Context): any {
  return ctx.params
}
