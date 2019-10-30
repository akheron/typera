import * as Either from 'fp-ts/lib/Either'
import { Middleware, Response, Route, applyMiddleware, router } from '..'
import * as request from 'supertest'
import { makeApp } from './utils'

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

describe('applyMiddleware', () => {
  it('works', async () => {
    const route = applyMiddleware(myMiddleware)

    const foo: Route<Response.Ok<string> | Response.BadRequest<string>> = route(
      'get',
      '/foo'
    )()(req => {
      return Response.ok(req.foo)
    })
    const app = makeApp().use(router(foo).handler())

    request(app)
      .get('/foo')
      .expect(200, 'foo')

    request(app)
      .get('/foo?err=true')
      .expect(400, 'quux')
  })
})
