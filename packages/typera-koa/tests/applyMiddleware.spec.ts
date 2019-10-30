import * as Either from 'fp-ts/lib/Either'
import { Middleware, Response, Route, applyMiddleware, router } from '..'
import * as request from 'supertest'
import { makeServer } from './utils'

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

describe('applyMiddleware', () => {
  let server: ReturnType<typeof makeServer> | null = null

  afterEach(() => {
    if (server) {
      server.close()
      server = null
    }
  })

  it('works', async () => {
    const route = applyMiddleware(myMiddleware)

    const foo: Route<Response.Ok<string> | Response.BadRequest<string>> = route(
      'get',
      '/foo'
    )()(req => {
      return Response.ok(req.foo)
    })
    server = makeServer(router(foo).handler())

    request(server)
      .get('/foo')
      .expect(200, 'foo')

    request(server)
      .get('/foo?err=true')
      .expect(400, 'quux')
  })
})
