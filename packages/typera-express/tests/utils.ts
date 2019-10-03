import * as express from 'express'
import * as bodyParser from 'body-parser'

export function makeApp(): express.Express {
  return express().use(bodyParser.json())
}
