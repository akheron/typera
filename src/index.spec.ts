import * as koa from 'koa'
import { Response, RouteHandler, routeHandler, run } from './index'

const testContext = (): koa.Context =>
  ({
    body: 'foo',
    response: {},
  } as koa.Context)

describe('foo', () => {
  let ctx: koa.Context

  beforeEach(() => {
    ctx = testContext()
  })

  it('bar', async () => {
    const handler: RouteHandler<Response.Ok<string>> = routeHandler(
      {},
      _request => {
        return Response.ok('foo')
      }
    )
    await run(handler)(ctx)
    expect(ctx.response).toEqual({ status: 200, body: 'foo' })
  })
})
