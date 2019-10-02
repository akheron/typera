import * as express from 'express'
import * as t from 'io-ts'
import {
  ExpressContext,
  Parser,
  Response,
  RouteHandler,
  routeHandler,
  run,
} from '..'

const testContext = (
  opts: {
    params?: any
    query?: any
    body?: any
  } = {}
): ExpressContext =>
  (<unknown>{
    req: {
      params: opts.params,
      query: opts.query,
      body: opts.body,
    },
    res: null,
  }) as ExpressContext

describe('routeHandler', () => {
  it('decodes request', async () => {
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
    await handler(testContext({ params: true, query: 'foo', body: 42 }))
  })

  it('passes response through', async () => {
    const handler: RouteHandler<Response.Ok<string>> = routeHandler()(_ => {
      return Response.ok('foo')
    })
    const response = await handler(testContext())
    expect(response).toEqual({ status: 200, body: 'foo' })
  })

  it('returns errors from parsers', async () => {
    const handler: RouteHandler<
      Response.NoContent | Response.BadRequest<string>
    > = routeHandler(Parser.body(t.number))(_request => {
      return Response.noContent()
    })
    const response = await handler(testContext({ body: 'foo' }))
    expect(response).toEqual({
      status: 400,
      body: 'Invalid body: Invalid value "foo" supplied to : number',
    })
  })
})

describe('run', () => {
  it('hands off the response to Koa', async () => {
    const status = jest.fn()
    const set = jest.fn()
    const send = jest.fn()

    const res = (<unknown>{ status, send, set }) as express.Response

    const handler = (_ctx: ExpressContext) =>
      Promise.resolve({ status: 200, body: 'foo', headers: { Bar: 'baz' } })

    await run(handler)((<unknown>{}) as express.Request, res)

    expect(status).toHaveBeenCalledWith(200)
    expect(set).toHaveBeenCalledWith({ Bar: 'baz' })
    expect(send).toHaveBeenCalledWith('foo')
  })
})
