import * as cors from 'cors'
import { Middleware, Response, router, route } from '..'
import * as request from 'supertest'
import { makeApp } from './utils'

describe('Middleware.wrapNative', () => {
  describe('cors middleware', () => {
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
})
