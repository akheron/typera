import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as t from 'io-ts'
import { Parser, Response, RouteHandler, routeHandler, run } from '..'
import * as request from 'supertest'

function makeApp() {
  return express().use(bodyParser.json())
}

describe('routeHandler', () => {
  it('works', async () => {
    const handler: RouteHandler<Response.Ok<string>> = routeHandler()(_ => {
      return Response.ok('foo')
    })
    const app = makeApp().get('/simple', run(handler))

    await request(app)
      .get('/simple')
      .expect(200, 'foo')
  })

  it('decodes request', async () => {
    const handler: RouteHandler<
      Response.NoContent | Response.NotFound | Response.BadRequest<string>
    > = routeHandler(
      Parser.routeParams(t.type({ foo: t.string })),
      Parser.query(t.type({ bar: t.string })),
      Parser.body(t.type({ baz: t.number }))
    )(request => {
      expect(request.routeParams).toEqual({ foo: 'FOO' })
      expect(request.query).toEqual({ bar: 'BAR' })
      expect(request.body).toEqual({ baz: 42 })
      return Response.noContent()
    })
    const app = makeApp().post('/decode/:foo', run(handler))

    await request(app)
      .post('/decode/FOO?bar=BAR')
      .send({ baz: 42 })
      .expect(204)
  })

  it('returns errors from middleware', async () => {
    const handler: RouteHandler<
      Response.NoContent | Response.BadRequest<string>
    > = routeHandler(Parser.body(t.type({ foo: t.number })))(_request => {
      return Response.noContent()
    })
    const app = makeApp().post('/error', run(handler))

    await request(app)
      .post('/error')
      .send({ foo: 'bar' })
      .expect(
        400,
        'Invalid body: Invalid value "bar" supplied to : { foo: number }/foo: number'
      )
  })
})
