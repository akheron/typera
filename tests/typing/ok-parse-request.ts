import * as typera from '../../src'
import * as t from 'io-ts'

interface ResponseBody {
  x: string
  y: boolean
  z: number
}

const routeCodec = t.type({
  x: t.string,
})

const queryCodec = t.type({
  y: t.boolean,
})

const bodyCodec = t.type({
  z: t.number,
})

export const handler: typera.RouteHandler<
  typera.Response.Ok<ResponseBody>
> = typera.routeHandler(
  typera.routeParams(routeCodec),
  typera.query(queryCodec),
  typera.body(bodyCodec)
)(req => {
  return typera.Response.ok({
    x: req.routeParams.x,
    y: req.query.y,
    z: req.body.z,
  })
})
