import { Middleware, Response, Route, applyMiddleware, router } from '..'
import * as request from 'supertest'
import { makeServer } from './utils'

describe('applyMiddleware', () => {
  let server: ReturnType<typeof makeServer> | null = null

  afterEach(() => {
    if (server) {
      server.close()
      server = null
    }
  })

  it('works', async () => {
    const myMiddleware: Middleware.Middleware<
      { foo: string },
      Response.BadRequest<string>
    > = ctx => {
      if (ctx.query.err != null) {
        return Middleware.stop(Response.badRequest('quux'))
      } else {
        return Middleware.next({ foo: 'bar' })
      }
    }
    const route = applyMiddleware(myMiddleware)

    const foo: Route<Response.Ok<string> | Response.BadRequest<string>> = route(
      'get',
      '/foo'
    )()(req => {
      return Response.ok(req.foo)
    })
    server = makeServer(router(foo).handler())

    await request(server).get('/foo').expect(200, 'bar')

    await request(server).get('/foo?err=true').expect(400, 'quux')
  })

  it('chaining', async () => {
    let middleware1 = 0
    const mw1: Middleware.Middleware<unknown, never> = () => {
      middleware1++
      return Middleware.next()
    }

    let middleware2 = 0
    const mw2: Middleware.Middleware<unknown, never> = () => {
      middleware2++
      return Middleware.next()
    }
    const route = applyMiddleware(mw1).use(mw2)

    const foo: Route<Response.Ok> = route.get('/foo')()(_ => {
      return Response.ok()
    })
    server = makeServer(router(foo).handler())

    await request(server).get('/foo').expect(200)

    expect(middleware1).toEqual(1)
    expect(middleware2).toEqual(1)
  })
})
