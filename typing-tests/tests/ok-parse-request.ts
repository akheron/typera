import { Response, Parser, Route, route } from 'typera-koa'
import * as t from 'io-ts'

interface ResponseBody {
  x: number
  y: string
  z: boolean
  w: string
  u: number
}

export const root: Route<
  Response.Ok<ResponseBody> | Response.NotFound | Response.BadRequest<string>
> = route
  .get('/foo/:x(int).:y-baz/bar)')
  .use(
    Parser.query(t.type({ z: t.boolean })),
    Parser.headers(t.type({ w: t.string })),
    Parser.body(t.type({ u: t.number }))
  )
  .handler(req => {
    return Response.ok({
      x: req.routeParams.x,
      y: req.routeParams.y,
      z: req.query.z,
      w: req.headers.w,
      u: req.body.u,
    })
  })
