import * as t from 'io-ts'
import { IntFromString } from 'io-ts-types/lib/IntFromString'
import { Parser, Response, Route, router, route } from '..'
import * as request from 'supertest'
import { makeApp } from './utils'

describe('parsers', () => {
  describe('headers', () => {
    it('simple', async () => {
      const parseHeaders: Route<
        Response.Ok<{ foo: string }> | Response.BadRequest<string>
      > = route
        .get('/parse-headers')
        .use(Parser.headers(t.type({ foo: t.string })))
        .handler((request) => {
          return Response.ok({
            foo: request.headers.foo,
          })
        })
      const app = makeApp().use(router(parseHeaders).handler())

      await request(app)
        .get('/parse-headers')
        .set('foo', 'bar')
        .expect(200, { foo: 'bar' })

      await request(app).get('/parse-headers').expect(400)
    })

    it('case insensitive', async () => {
      const test: Route<
        | Response.Ok<{
            'API-KEY': string
            'api-key': string
            'aPi-KeY': string
          }>
        | Response.BadRequest<string>
      > = route
        .get('/headers')
        .use(
          Parser.headers(
            t.type({
              'API-KEY': t.string,
              'api-key': t.string,
              'aPi-KeY': t.string,
            })
          )
        )
        .handler(async (request) => {
          return Response.ok(request.headers)
        })

      const app = makeApp().use(router(test).handler())

      await request(app)
        .get('/headers')
        .set('API-KEY', 'foo')
        .expect(200, { 'API-KEY': 'foo', 'api-key': 'foo', 'aPi-KeY': 'foo' })
    })

    it('complex codec', async () => {
      const test: Route<
        | Response.Ok<{ 'API-Key': string; 'X-Foo'?: number }>
        | Response.BadRequest<string>
      > = route
        .get('/headers')
        .use(
          Parser.headers(
            t.exact(
              t.intersection([
                t.type({ 'API-Key': t.string }),
                t.partial({ 'X-Foo': IntFromString }),
              ])
            )
          )
        )
        .handler(async (request) => Response.ok(request.headers))

      const app = makeApp().use(router(test).handler())

      await request(app)
        .get('/headers')
        .set('API-Key', 'foo')
        .set('X-Foo', '123')
        .expect(200, { 'API-Key': 'foo', 'X-Foo': 123 })
    })
  })
})
