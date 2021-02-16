import * as cors from 'cors'
import * as helmet from 'helmet'
import { Middleware, Response, router, route } from '..'
import * as request from 'supertest'
import { makeApp } from './utils'

describe('Middleware.wrapNative', () => {
  describe('cors', () => {
    const ORIGIN = 'http://example.com'
    const OPTIONS_STATUS = 234

    const wrappedCors = Middleware.wrapNative(
      cors({
        origin: ORIGIN,
        optionsSuccessStatus: OPTIONS_STATUS,
      })
    )

    const testRouteOptions = route
      .options('/test')
      .use(wrappedCors)
      .handler(async () => {
        throw new Error('never reached')
      })
    const testRoute = route
      .post('/test')
      .use(wrappedCors)
      .handler(async () => {
        return Response.ok('success')
      })

    const app = makeApp().use(router(testRouteOptions, testRoute).handler())

    it('normal request', async () => {
      await request(app)
        .post('/test')
        .expect(200, 'success')
        .expect('Access-Control-Allow-Origin', ORIGIN)
    })
    it('preflight request', async () => {
      await request(app).options('/test').expect(OPTIONS_STATUS)
    })
  })

  describe('helmet', () => {
    const wrappedHelmet = Middleware.wrapNative(helmet())

    const testRoute = route
      .post('/test')
      .use(wrappedHelmet)
      .handler(async () => {
        return Response.ok('success')
      })

    const app = makeApp().use(router(testRoute).handler())

    it('works', async () => {
      await request(app)
        .post('/test')
        .expect(200, 'success')
        .expect('Referrer-Policy', 'no-referrer')
        .expect((res) => {
          const poweredBy = res.get('X-Powered-By')
          if (poweredBy) {
            throw new Error(
              `X-Powered-By header should not be set but was ${poweredBy}`
            )
          }
        })
    })
  })
})
