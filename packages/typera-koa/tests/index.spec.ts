import * as Either from 'fp-ts/lib/Either'
import * as http from 'http'
import * as Koa from 'koa'
import * as koaBodyparser from 'koa-bodyparser'
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

function makeServer(router: koaRouter): http.Server {
  const app = new Koa()
  app.use(koaBodyparser())
  app.use(router.routes())
  return app.listen(53823)
}

describe('routeHandler', () => {
  let server: http.Server | null

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
    server = makeServer(router)

    await request(server)
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

    const router = new koaRouter().post('/decode/:foo', run(handler))
    server = makeServer(router)

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
    server = makeServer(router)

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
        setTimeout(() => resolve(Either.right({ foo: 42 })), 10)
      })

    const handler: RouteHandler<
      Response.NoContent | Response.BadRequest<string>
    > = routeHandler(mw)(request => {
      expect(request.foo).toEqual(42)
      return Response.noContent()
    })
    const router = new koaRouter().get('/asyncmw', run(handler))
    server = makeServer(router)

    await request(server)
      .get('/asyncmw')
      .expect(204)
  })
})
