import { Response, Parser, RouteHandler, routeHandler } from '../../src'
import * as t from 'io-ts'

interface ResponseBody {
  x: string
  y: boolean
  z: number
}

export const handler: RouteHandler<
  Response.Ok<ResponseBody> | Response.NotFound | Response.BadRequest<string>
> = routeHandler(
  Parser.routeParams(t.type({ x: t.string })),
  Parser.query(t.type({ y: t.boolean })),
  Parser.body(t.type({ z: t.number }))
)(req => {
  return Response.ok({
    x: req.routeParams.x,
    y: req.query.y,
    z: req.body.z,
  })
})
