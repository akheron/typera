import * as typera from 'typera-koa'

const handler = typera.route
  .get('/foo')
  .dependsOn<{ dep: number }>()
  .handler((_req) => {
    return typera.Response.ok(42)
  })

export default typera.router(handler)

// Expected error:
// TODO: Something about unsatisfied middleware
