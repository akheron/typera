export const Response = {
  ok: body => ({ status: 200, body }),
  created: body => ({ status: 201, body }),
  noContent: () => ({ status: 204 }),
  badRequest: body => ({ status: 400, body }),
  notFound: body => ({ status: 404, body }),
}

export function routeHandler(...args) {
  const codecs = Object.fromEntries(args)
  return function(handler) {
    return function(ctx) {
      const routeParams = codecs.routeParams
        ? codecs.routeParams.decode(ctx.params).getOrElseL(() => ctx.throw(404))
        : undefined
      const query = codecs.query
        ? codecs.query
            .decode(ctx.request.query)
            .getOrElseL(() => ctx.throw(400, 'Invalid query'))
        : undefined
      const body = codecs.body
        ? codecs.body
            .decode(ctx.request.body)
            .getOrElseL(() => ctx.throw(400, 'Invalid body'))
        : undefined

      const request = {
        routeParams,
        query,
        body,
        ctx,
      }
      return handler(request)
    }
  }
}

export function run(routeHandler) {
  return async function(ctx) {
    const response = await routeHandler(ctx)
    ctx.response.status = response.status
    ctx.response.body = response.body
  }
}

export function body(codec) {
  return ['body', codec]
}

export function routeParams(codec) {
  return ['routeParams', codec]
}

export function query(codec) {
  return ['query', codec]
}
