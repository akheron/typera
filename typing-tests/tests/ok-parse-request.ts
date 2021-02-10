import { Response, Parser, Route, URL, route } from 'typera-koa'
import * as t from 'io-ts'

interface ResponseBody {
  x: number
  y: string
  z: boolean
  w: number
  u: boolean
  n: string
  m: number
}

declare const trans1: URL.Conversion<boolean>
declare const trans2: URL.Conversion<number>

export const root: Route<
  Response.Ok<ResponseBody> | Response.NotFound | Response.BadRequest<string>
> = route
  .useParamConversions({ trans1, trans2 })
  .get('/foo/:x(int).:y-baz/bar/:z(trans1)/:w(trans2)')
  .use(
    Parser.query(t.type({ u: t.boolean })),
    Parser.headers(t.type({ n: t.string })),
    Parser.body(t.type({ m: t.number }))
  )
  .handler((req) => {
    return Response.ok({
      x: req.routeParams.x,
      y: req.routeParams.y,
      z: req.routeParams.z,
      w: req.routeParams.w,
      u: req.query.u,
      n: req.headers.n,
      m: req.body.m,
    })
  })
