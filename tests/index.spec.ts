import * as koa from 'koa'
import * as t from 'io-ts'
import * as ra from '../lib/index'

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
    const handler: ra.RouteHandler<ra.Response.NoContent> = ra.routeHandler(
      ra.routeParams(t.boolean),
      ra.query(t.string),
      ra.body(t.number)
    )(request => {
      expect(request.routeParams).toEqual(true)
      expect(request.query).toEqual('foo')
      expect(request.body).toEqual(42)
      return ra.Response.noContent()
    })
    handler(testContext({ params: true, query: 'foo', body: 42 }))
  })

  it('passes response through', () => {
    const handler: ra.RouteHandler<ra.Response.Ok<string>> = ra.routeHandler()(
      _ => {
        return ra.Response.ok('foo')
      }
    )
    const response = handler(testContext())
    expect(response).toEqual({ status: 200, body: 'foo' })
  })
})
