import * as koa from 'koa'
import * as t from 'io-ts'
import * as typera from '../../src'

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
    const handler: typera.RouteHandler<
      typera.Response.NoContent
    > = typera.routeHandler(
      typera.routeParams(t.boolean),
      typera.query(t.string),
      typera.body(t.number)
    )(request => {
      expect(request.routeParams).toEqual(true)
      expect(request.query).toEqual('foo')
      expect(request.body).toEqual(42)
      return typera.Response.noContent()
    })
    handler(testContext({ params: true, query: 'foo', body: 42 }))
  })

  it('passes response through', () => {
    const handler: typera.RouteHandler<
      typera.Response.Ok<string>
    > = typera.routeHandler()(_ => {
      return typera.Response.ok('foo')
    })
    const response = handler(testContext())
    expect(response).toEqual({ status: 200, body: 'foo' })
  })
})
