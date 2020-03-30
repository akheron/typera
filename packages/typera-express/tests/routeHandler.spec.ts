import * as stream from 'stream'
import * as t from 'io-ts'
import { ErrorRequestHandler } from 'express'
import {
  ExpressContext,
  Middleware,
  Parser,
  Response,
  RouteHandler,
  routeHandler,
  run,
} from '..'
import * as request from 'supertest'
import { makeApp } from './utils'

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

  it('forwards thrown errors to express error handling middleware', async () => {
    const handler: RouteHandler<Response.Ok> = routeHandler()(
      async _request => {
        throw new Error('Unexpected error')
        return Response.ok()
      }
    )

    const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
      res.status(500).send(err.message)
    }

    const app = makeApp()
    app.get('/test', run(handler))
    app.use(errorHandler)

    await request(app)
      .get('/test')
      .expect(500, 'Unexpected error')
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

  it('async middleware', async () => {
    const mw: Middleware.Middleware<{ foo: number }, never> = (
      _: ExpressContext
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
    const app = makeApp().get('/asyncmw', run(handler))

    await request(app)
      .get('/asyncmw')
      .expect(204)
  })

  it('streaming body', async () => {
    const handler: RouteHandler<Response.Ok<
      Response.StreamingBody
    >> = routeHandler()(async () => {
      const body = Response.streamingBody(outStream => {
        const s = new stream.Readable()
        s.pipe(outStream)
        s.push('foo')
        s.push('bar')
        s.push(null)
      })
      return Response.ok(body)
    })

    const app = makeApp().get('/streaming', run(handler))

    await request(app)
      .get('/streaming')
      .expect(200, 'foobar')
  })
})
