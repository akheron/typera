export const Response = {
  ok: body => ({ status: 200, body }),
  created: body => ({ status: 201, body }),
  noContent: () => ({ status: 204 }),
  badRequest: body => ({ status: 400, body }),
  notFound: body => ({ status: 404, body }),
}

export const routeHandler = (...args) => {
  const parseRequest = ctx => ({
    ...args.reduce((acc, parser) => ({ ...acc, ...parser(ctx) }), {}),
    ctx,
  })
  return handler => ctx => handler(parseRequest(ctx))
}

export const run = routeHandler => async ctx => {
  const response = await routeHandler(ctx)
  ctx.response.status = response.status
  ctx.response.body = response.body
}

export const routeParams = codec => ctx =>
  codec
    .decode(ctx.params)
    .map(routeParams => ({ routeParams }))
    .getOrElseL(() => ctx.throw(404))

export const query = codec => ctx =>
  codec
    .decode(ctx.request.query)
    .map(query => ({ query }))
    .getOrElseL(() => ctx.throw(400, 'Invalid query'))

export const body = codec => ctx =>
  codec
    .decode(ctx.request.body)
    .map(body => ({ body }))
    .getOrElseL(() => ctx.throw(400, 'Invalid body'))
