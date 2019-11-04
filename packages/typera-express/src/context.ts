import express = require('express')

export interface ExpressContext {
  req: express.Request
  res: express.Response
}

export function getRouteParams(e: ExpressContext): any {
  return e.req.params
}
