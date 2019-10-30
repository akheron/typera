import * as Either from 'fp-ts/lib/Either'
import * as Koa from 'koa'
import * as koaRouter from 'koa-router'
import * as t from 'io-ts'
import {
  Middleware,
  Parser,
  Response,
  RouteHandler,
  routeHandler,
  run,
} from '..'
import * as request from 'supertest'
import { makeServer } from './utils'

describe('routeHandler', () => {
  let server: ReturnType<typeof makeServer> | null = null

  afterEach(() => {
    if (server) {
      server.close()
      server = null
    }
  })

  it('works', async () => {
    const handler: RouteHandler<Response.Ok<string>> = routeHandler()(_ => {
      return Response.ok('foo')
    })
    const router = new koaRouter().get('/simple', run(handler))
    server = makeServer(router.routes())

    await request(server)
      .get('/simple')
      .expect(200, 'foo')
  })

  it('decodes the request', async () => {
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

    const router = new koaRouter().post('/decode/:foo', run(handler))
    server = makeServer(router.routes())

    await request(server)
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
    const router = new koaRouter().post('/error', run(handler))
    server = makeServer(router.routes())

    await request(server)
      .post('/error')
      .send({ foo: 'bar' })
      .expect(
        400,
        'Invalid body: Invalid value "bar" supplied to : { foo: number }/foo: number'
      )
  })

  it('async middleware', async () => {
    const mw: Middleware.Middleware<{ foo: number }, never> = (
      _: Koa.Context
    ) =>
      new Promise((resolve, _reject) => {
        setTimeout(() => resolve(Middleware.next({ foo: 42 })), 10)
      })

    const handler: RouteHandler<
      Response.NoContent | Response.BadRequest<string>
    > = routeHandler(mw)(request => {
      expect(request.foo).toEqual(42)
      return Response.noContent()
    })
    const router = new koaRouter().get('/asyncmw', run(handler))
    server = makeServer(router.routes())

    await request(server)
      .get('/asyncmw')
      .expect(204)
  })
})
