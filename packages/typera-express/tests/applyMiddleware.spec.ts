import { Middleware, Response, Route, applyMiddleware, router } from '..'
import * as request from 'supertest'
import { makeApp } from './utils'

describe('applyMiddleware', () => {
  it('works', async () => {
    const myMiddleware: Middleware.Middleware<
      { foo: string },
      Response.BadRequest<string>
    > = ({ req }) => {
      if (req.query.err != null) {
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
    const app = makeApp().use(router(foo).handler())

    await request(app).get('/foo').expect(200, 'bar')

    await request(app).get('/foo?err=true').expect(400, 'quux')
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
    const app = makeApp().use(router(foo).handler())

    await request(app).get('/foo').expect(200)

    expect(middleware1).toEqual(1)
    expect(middleware2).toEqual(1)
  })
})
