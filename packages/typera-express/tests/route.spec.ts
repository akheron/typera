import * as Option from 'fp-ts/lib/Option'
import * as stream from 'stream'
import { Response as ExpressResponse } from 'express'
import * as t from 'io-ts'
import { Middleware, Parser, Response, Route, URL, router, route } from '..'
import * as request from 'supertest'
import { makeApp } from './utils'

describe('route & router', () => {
  it('works', async () => {
    const foo: Route<Response.Ok<string>> = route.get('/foo').handler((_) => {
      return Response.ok('foo')
    })
    const app = makeApp().use(router(foo).handler())

    await request(app).get('/foo').expect(200)
  })

  it('supports adding multiple routes', async () => {
    const foo: Route<Response.Ok<string>> = route.get('/foo').handler((_) => {
      return Response.ok('foo')
    })
    const bar: Route<Response.Ok<string>> = route.get('/bar').handler((_) => {
      return Response.ok('bar')
    })
    const baz: Route<Response.Ok<string>> = route.get('/baz').handler((_) => {
      return Response.ok('baz')
    })
    const quux: Route<Response.Ok<string>> = route.get('/quux').handler((_) => {
      return Response.ok('quux')
    })

    const handler = router(foo, bar).add(baz, quux).handler()
    const app = makeApp().use(handler)

    await request(app).get('/foo').expect(200, 'foo')
    await request(app).get('/bar').expect(200, 'bar')
    await request(app).get('/baz').expect(200, 'baz')
    await request(app).get('/quux').expect(200, 'quux')
  })

  it('decodes the request', async () => {
    let callCount = 0
    const decode: Route<Response.NoContent | Response.BadRequest<string>> =
      route
        .post('/decode/:foo/:bar(int)')
        .use(
          Parser.query(t.type({ baz: t.string })),
          Parser.body(t.type({ quux: t.boolean }))
        )
        .handler((request) => {
          callCount++
          expect(request.routeParams).toEqual({ foo: 'FOO', bar: 42 })
          expect(request.query).toEqual({ baz: 'hello' })
          expect(request.body).toEqual({ quux: true })
          return Response.noContent()
        })

    const handler = router(decode).handler()
    const app = makeApp().use(handler)

    await request(app)
      .post('/decode/FOO/42?baz=hello')
      .send({ quux: true })
      .expect(204)
    expect(callCount).toEqual(1)
  })

  it('custom path conversions', async () => {
    const silly: URL.Conversion<boolean> = (value) =>
      value === 'silly' ? Option.some(true) : Option.none

    const funny: URL.Conversion<number> = (value) =>
      value === 'funny' ? Option.some(42) : Option.none

    let callCount = 0
    const decode: Route<Response.NoContent | Response.BadRequest<string>> =
      route
        .useParamConversions({ silly, funny })
        .post('/decode/:foo(silly)/:bar(funny)')
        .handler((request) => {
          callCount++
          expect(request.routeParams).toEqual({ foo: true, bar: 42 })
          return Response.noContent()
        })

    const handler = router(decode).handler()
    const app = makeApp().use(handler)

    await request(app).post('/decode/notgonna/work').expect(404)
    await request(app).post('/decode/silly/wrong').expect(404)
    await request(app).post('/decode/wrong/funny').expect(404)
    await request(app).post('/decode/silly/funny').expect(204)
    expect(callCount).toEqual(1)
  })

  it('routeParams are available to middleware', async () => {
    const mw: Middleware.ChainedMiddleware<
      { routeParams: { id: number } },
      { foo: number },
      never
    > = async (request) => Middleware.next({ foo: request.routeParams.id })

    const test = route
      .get('/foo/:id(int)')
      .use(mw)
      .handler(async (request) => Response.ok({ foo: request.foo }))

    const app = makeApp().use(router(test).handler())
    await request(app).get('/foo/123').expect(200, { foo: 123 })
  })

  it('forwards thrown errors to express error handling middleware', async () => {
    const exception = route.get('/').handler(async () => {
      throw new Error('Unexpected error')
    })

    const handler = router(exception).handler()
    const app = makeApp().use(handler)
    app.use((err: Error, _req: any, res: ExpressResponse, _next: any) => {
      res.status(500).send('Got exception: ' + err.message)
    })
    await request(app).get('/').expect(500, 'Got exception: Unexpected error')
  })

  it('returns errors from middleware', async () => {
    const error: Route<Response.NoContent | Response.BadRequest<string>> = route
      .post('/error')
      .use(Parser.body(t.type({ foo: t.number })))
      .handler((_request) => {
        return Response.noContent()
      })
    const handler = router(error).handler()
    const app = makeApp().use(handler)

    await request(app)
      .post('/error')
      .send({ foo: 'bar' })
      .expect(
        400,
        'Invalid body: Invalid value "bar" supplied to : { foo: number }/foo: number'
      )
  })

  it('runs middleware finalizers', async () => {
    let middleware1 = 0
    let finalizer1 = 0
    const mw1: Middleware.Middleware<{}, never> = () => {
      middleware1++
      return Middleware.next({}, () => {
        finalizer1++
      })
    }

    let middleware2 = 0
    let finalizer2 = 0
    const mw2: Middleware.Middleware<unknown, never> = () => {
      middleware2++
      return Middleware.next(undefined, () => {
        finalizer2++
      })
    }

    const root: Route<Response.Ok> = route
      .get('/')
      .use(mw1, mw2)
      .handler((_request) => {
        return Response.ok()
      })
    const handler = router(root).handler()
    const app = makeApp().use(handler)

    await request(app).get('/').expect(200)

    expect(middleware1).toEqual(1)
    expect(finalizer1).toEqual(1)
    expect(middleware2).toEqual(1)
    expect(finalizer2).toEqual(1)
  })

  it('async middleware', async () => {
    const mw: Middleware.Middleware<{ foo: number }, never> = () =>
      new Promise((resolve, _reject) => {
        setTimeout(() => resolve(Middleware.next({ foo: 42 })), 10)
      })

    const test: Route<Response.NoContent> = route
      .get('/asyncmw')
      .use(mw)
      .handler((request) => {
        expect(request.foo).toEqual(42)
        return Response.noContent()
      })

    const handler = router(test).handler()
    const app = makeApp().use(handler)

    await request(app).get('/asyncmw').expect(204)
  })

  it('runs previous middleware finalizers when a middleware returns a response', async () => {
    let middleware1 = 0
    let finalizer1 = 0
    const mw1: Middleware.Middleware<{}, never> = () => {
      middleware1++
      return Middleware.next({}, () => {
        finalizer1++
      })
    }

    let middleware2 = 0
    const mw2: Middleware.Middleware<{}, Response.Unauthorized> = () => {
      middleware2++
      return Middleware.stop(Response.unauthorized())
    }

    const root: Route<Response.Ok | Response.Unauthorized> = route
      .get('/')
      .use(mw1, mw2)
      .handler((_request) => {
        return Response.ok()
      })
    const handler = router(root).handler()
    const app = makeApp().use(handler)

    await request(app).get('/').expect(401)

    expect(middleware1).toEqual(1)
    expect(finalizer1).toEqual(1)
    expect(middleware2).toEqual(1)
  })

  it('ignores exceptions from middleware finalizers', async () => {
    let middleware1 = 0
    let finalizer1 = 0
    const mw1: Middleware.Middleware<{}, never> = () => {
      middleware1++
      return Middleware.next({}, () => {
        finalizer1++
        throw new Error('This exception should be ignored')
      })
    }

    let middleware2 = 0
    let finalizer2 = 0
    const mw2: Middleware.Middleware<{}, never> = () => {
      middleware2++
      return Middleware.next({}, () => {
        finalizer2++
      })
    }

    const root: Route<Response.Ok> = route
      .get('/')
      .use(mw1, mw2)
      .handler((_request) => {
        return Response.ok()
      })
    const handler = router(root).handler()
    const app = makeApp().use(handler)

    await request(app).get('/').expect(200)

    expect(middleware1).toEqual(1)
    expect(finalizer1).toEqual(1)
    expect(middleware2).toEqual(1)
    expect(finalizer2).toEqual(1)
  })

  it('buffer body', async () => {
    const test: Route<Response.Ok<Buffer>> = route
      .get('/buffer')
      .handler(async () => {
        return Response.ok(Buffer.from('foobar', 'utf-8'))
      })

    const handler = router(test).handler()
    const app = makeApp().use(handler)

    await request(app)
      .get('/buffer')
      .expect(200)
      .expect('Content-Type', 'application/octet-stream')
      .expect((res) => {
        if (!(res.body as Buffer).equals(Buffer.from('foobar', 'utf-8'))) {
          throw new Error('expected body "foobar" as a buffer')
        }
      })
  })

  it('streaming body', async () => {
    const test = route.get('/streaming').handler(async () => {
      const body = Response.streamingBody((outStream) => {
        const s = new stream.Readable()
        s.pipe(outStream)
        s.push('foo')
        s.push('bar')
        s.push(null)
      })
      return Response.ok(body)
    })

    const handler = router(test).handler()
    const app = makeApp().use(handler)

    await request(app).get('/streaming').expect(200, 'foobar')
  })
})
