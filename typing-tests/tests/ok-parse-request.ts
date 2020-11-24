import { Response, Parser, Route, URL, route } from 'typera-koa'
import * as t from 'io-ts'

interface ResponseBody {
  x: number
  y: boolean
  z: string
  w: number
}

export const root: Route<
  Response.Ok<ResponseBody> | Response.NotFound | Response.BadRequest<string>
> = route
  .get('/', URL.int('x'))
  .use(
    Parser.query(t.type({ y: t.boolean })),
    Parser.headers(t.type({ z: t.string })),
    Parser.body(t.type({ w: t.number }))
  )
  .handler(req => {
    return Response.ok({
      x: req.routeParams.x,
      y: req.query.y,
      z: req.headers.z,
      w: req.body.w,
    })
  })
