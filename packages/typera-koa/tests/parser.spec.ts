import * as t from 'io-ts'
import { Parser, Response, Route, router, route } from '..'
import * as request from 'supertest'
import { makeServer } from './utils'

describe('parsers', () => {
  let server: ReturnType<typeof makeServer> | null = null

  afterEach(() => {
    if (server) {
      server.close()
      server = null
    }
  })

  describe('cookies', () => {
    // koa's cookie parsing has extra logic

    const setup = <T>(codec: t.Type<T, any, unknown>) => {
      const parseCookies: Route<Response.Ok<T> | Response.BadRequest<string>> =
        route
          .get('/parse-cookies')
          .use(Parser.cookies(codec))
          .handler((request) => {
            return Response.ok(request.cookies)
          })
      server = makeServer(router(parseCookies).handler())
    }

    it('one cookie', async () => {
      setup(t.type({ Authorization: t.string }))

      await request(server)
        .get('/parse-cookies')
        .set('Cookie', 'Authorization=foobar')
        .expect(200, { Authorization: 'foobar' })
    })
    it('two cookies', async () => {
      setup(t.strict({ Authorization: t.string, 'X-Foo-Bar': t.string }))

      await request(server)
        .get('/parse-cookies')
        .set(
          'Cookie',
          'X-Foo-Bar=something; Authorization=other; irrelevant-header=quux'
        )
        .expect(200, { Authorization: 'other', 'X-Foo-Bar': 'something' })
    })
    it('error handling', async () => {
      setup(t.strict({ Authorization: t.string }))
      await request(server)
        .get('/parse-cookies')
        .expect(400, /^Invalid cookies: /)
    })
  })
})
