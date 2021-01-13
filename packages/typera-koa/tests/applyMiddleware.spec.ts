import {
  Middleware,
  Response,
  Route,
  RequestBase,
  applyMiddleware,
  route,
  router,
} from '..'
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
    > = (req) => {
      if (req.ctx.query.err != null) {
        return Middleware.stop(Response.badRequest('quux'))
      } else {
        return Middleware.next({ foo: 'bar' })
      }
    }
    const route = applyMiddleware(myMiddleware)

    const foo: Route<Response.Ok<string> | Response.BadRequest<string>> = route(
      'get',
      '/foo'
    ).handler((req) => {
      return Response.ok(req.foo)
    })
    server = makeServer(router(foo).handler())

    await request(server).get('/foo').expect(200, 'bar')

    await request(server).get('/foo?err=true').expect(400, 'quux')
  })

  it('basic chaining', async () => {
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

    const foo: Route<Response.Ok> = route.get('/foo').handler((_) => {
      return Response.ok()
    })
    server = makeServer(router(foo).handler())

    await request(server).get('/foo').expect(200)

    expect(middleware1).toEqual(1)
    expect(middleware2).toEqual(1)
  })

  describe('chaining allows using previous middleware result', () => {
    const mw1: Middleware.Middleware<{ num: number }, never> = () =>
      Middleware.next({ num: 42 })

    const mw2: Middleware.ChainedMiddleware<
      { num: number },
      { str: string },
      never
    > = (req) => Middleware.next({ str: req.num.toString() })

    const handler = async (req: RequestBase & { num: number; str: string }) => {
      expect(req.num).toEqual(42)
      expect(req.str).toEqual('42')
      return Response.ok()
    }

    const run = async (fooRoute: Route<Response.Ok>) => {
      server = makeServer(router(fooRoute).handler())
      await request(server).get('/foo').expect(200)
    }

    it('both outside the route', async () => {
      const routeFn = applyMiddleware(mw1).use(mw2)
      const foo: Route<Response.Ok> = routeFn.get('/foo').handler(handler)
      await run(foo)
    })

    it('second inside the route', async () => {
      const routeFn = applyMiddleware(mw1)
      const foo: Route<Response.Ok> = routeFn
        .get('/foo')
        .use(mw2)
        .handler(handler)
      await run(foo)
    })

    it('both inside the route', async () => {
      const foo: Route<Response.Ok> = route
        .get('/foo')
        .use(mw1)
        .use(mw2)
        .handler(handler)
      await run(foo)
    })
  })
})
