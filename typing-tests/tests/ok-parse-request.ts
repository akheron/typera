import { Response, Parser, RouteHandler, routeHandler } from 'typera-koa'
import * as t from 'io-ts'

interface ResponseBody {
  x: string
  y: boolean
  z: string
  w: number
}

export const handler: RouteHandler<
  Response.Ok<ResponseBody> | Response.NotFound | Response.BadRequest<string>
> = routeHandler(
  Parser.routeParams(t.type({ x: t.string })),
  Parser.query(t.type({ y: t.boolean })),
  Parser.headers(t.type({ z: t.string })),
  Parser.body(t.type({ w: t.number }))
)(req => {
  return Response.ok({
    x: req.routeParams.x,
    y: req.query.y,
    z: req.headers.z,
    w: req.body.w,
  })
})
