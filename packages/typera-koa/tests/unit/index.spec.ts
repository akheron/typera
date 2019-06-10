import * as koa from 'koa'
import * as t from 'io-ts'
import { Parser, Response, RouteHandler, routeHandler, run } from '../../src'

const testContext = (
  opts: {
    params?: any
    query?: any
    body?: any
  } = {}
): koa.Context =>
  (<unknown>{
    params: opts.params,
    request: { query: opts.query, body: opts.body },
    response: {},
  }) as koa.Context

describe('routeHandler', () => {
  it('decodes request', () => {
    const handler: RouteHandler<
      Response.NoContent | Response.NotFound | Response.BadRequest<string>
    > = routeHandler(
      Parser.routeParams(t.boolean),
      Parser.query(t.string),
      Parser.body(t.number)
    )(request => {
      expect(request.routeParams).toEqual(true)
      expect(request.query).toEqual('foo')
      expect(request.body).toEqual(42)
      return Response.noContent()
    })
    handler(testContext({ params: true, query: 'foo', body: 42 }))
  })

  it('passes response through', () => {
    const handler: RouteHandler<Response.Ok<string>> = routeHandler()(_ => {
      return Response.ok('foo')
    })
    const response = handler(testContext())
    expect(response).toEqual({ status: 200, body: 'foo' })
  })

  it('returns errors from parsers', () => {
    const handler: RouteHandler<
      Response.NoContent | Response.BadRequest<string>
    > = routeHandler(Parser.body(t.number))(_request => {
      return Response.noContent()
    })
    const response = handler(testContext({ body: 'foo' }))
    expect(response).toEqual({ status: 400, body: 'invalid body' })
  })
})

describe('run', () => {
  it('hands off the response to Koa', async () => {
    const ctx = testContext()
    const handler = (_ctx: koa.Context) =>
      Promise.resolve({ status: 200, body: 'foo' })

    await run(handler)(ctx)

    expect(ctx.response.status).toEqual(200)
    expect(ctx.response.body).toEqual('foo')
  })
})
