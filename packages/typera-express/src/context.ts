import express = require('express')

export interface RequestBase {
  req: express.Request
  res: express.Response
}

export function getRouteParams(e: RequestBase): any {
  return e.req.params
}
