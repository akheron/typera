import * as cors from 'cors'
import * as helmet from 'helmet'
import * as session from 'express-session'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Middleware, Response, applyMiddleware, router, route } from '..'
import * as request from 'supertest'
import { makeApp } from './utils'

const parseCookie = (response: request.Response) =>
  response.get('Set-Cookie')[0].split(';')[0]

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

  describe('session', () => {
    const wrappedSession = Middleware.wrapNative(session({ secret: 'foobar' }))

    const testRoute = route
      .post('/test')
      .use(wrappedSession)
      .handler(async (request) => {
        if (request.req.session.views) request.req.session.views++
        else request.req.session.views = 1
        request.req.session.save()
        return Response.ok({ views: request.req.session.views })
      })

    const app = makeApp().use(router(testRoute).handler())

    it('works', async () => {
      const response = await request(app)
        .post('/test')
        .expect(200, { views: 1 })
      const cookie = parseCookie(response)

      for (let i = 2; i <= 4; i++) {
        await request(app)
          .post('/test')
          .set('Cookie', cookie)
          .expect(200, { views: i })
      }
    })
  })

  describe('passport', () => {
    passport.use(
      new LocalStrategy((username, password, done) => {
        if (username === 'user' && password == 'pass') {
          // Success
          done(null, { id: 1, name: 'user' })
        } else if (username === 'error') {
          // Unexpected error
          done(new Error('error here'))
        } else {
          // Authentication failure
          done(null, false, { message: 'Invalid username or password' })
        }
      })
    )

    passport.serializeUser((user, done) => {
      done(null, JSON.stringify(user))
    })

    passport.deserializeUser((user, done) => {
      if (typeof user === 'string') {
        done(null, JSON.parse(user))
      } else {
        done(new Error('expected string'))
      }
    })

    const authenticate = Middleware.wrapNative(passport.authenticate('local'))

    const isAuthenticated: Middleware.Middleware<
      { authenticated: boolean },
      never
    > = (request) =>
      Middleware.next({ authenticated: request.req.isAuthenticated() })

    const route = applyMiddleware(
      Middleware.wrapNative(passport.initialize()),
      Middleware.wrapNative(passport.session()),
      isAuthenticated
    )

    const login = route
      .post('/login')
      .use(authenticate)
      .handler(async () => {
        return Response.redirect(302, '/')
      })

    const test = route.get('/test').handler(async (request) => {
      return Response.ok({ authenticated: request.authenticated })
    })

    const app = makeApp()
    app.use(cookieParser())
    app.use(bodyParser.json())
    app.use(session({ secret: 'hush', resave: true, saveUninitialized: true }))
    app.use(router(login, test).handler())

    it('login success', async () => {
      await request(app)
        .post('/login')
        .send({ username: 'user', password: 'pass' })
        .expect(302)
        .expect('Location', '/')
        .expect('Set-Cookie', /=/)
    })
    it('login failure', async () => {
      await request(app)
        .post('/login')
        .send({ username: 'user', password: 'wrong' })
        .expect(401)
    })
    it('unexpected error', async () => {
      await request(app)
        .post('/login')
        .send({ username: 'error', password: 'something' })
        .expect(500, /Error: error here/)
    })
    it('not authenticated', async () => {
      await request(app).get('/test').expect({ authenticated: false })
    })
    it('authenticated', async () => {
      const response = await request(app)
        .post('/login')
        .send({ username: 'user', password: 'pass' })
      const cookie = parseCookie(response)
      await request(app)
        .get('/test')
        .set('Cookie', [cookie])
        .send()
        .expect({ authenticated: true })
    })
  })
})

declare global {
  namespace Express {
    interface User {
      id: number
      name: string
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    views: number
  }
}
