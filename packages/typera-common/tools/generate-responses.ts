// Run `yarn generate-responses` to generate src/response.ts

const header = `\
// This file is generated, do not edit! See ../tools/generate-responses.ts

type OptionalHeaders = { [key: string]: string } | undefined

export type Response<Status, Body, Headers extends OptionalHeaders> = {
  status: Status
  body: Body
  headers: Headers
}

export type Generic = Response<number, any, OptionalHeaders>

`

type ResponseDef = {
  status: number
  name: string
  fnName: string
  defaultBodyType: string
  defaultHeadersType: string
}

const generateCode = (d: ResponseDef): string => `\
export type ${d.name}<Body = ${d.defaultBodyType}, Headers extends OptionalHeaders = ${d.defaultHeadersType}> = Response<${d.status}, Body, Headers>
export function ${d.fnName}<Body, Headers extends OptionalHeaders>(body: Body, headers: Headers): ${d.name}<Body, Headers>
export function ${d.fnName}<Body>(body: Body): ${d.name}<Body, undefined>
export function ${d.fnName}(): ${d.name}<undefined, undefined>
export function ${d.fnName}(body = undefined, headers = undefined) {
  return { status: ${d.status}, body, headers }
}

`

const footer = `\

type RedirectStatus = 301 | 302 | 303 | 307 | 308

function redirectName(status: RedirectStatus): string {
  switch (status) {
    case 301: return 'Moved permanently'
    case 302: return 'Found'
    case 303: return 'See other'
    case 307: return 'Temporary redirect'
    case 308: return 'Permanent redirect'
  }
}

export function redirect<Status extends RedirectStatus>(
  status: Status,
  location: string
): Response<Status, string, { location: string }> {
  return {
    status,
    body: \`\${redirectName(status)}. Redirecting to \${location}\`,
    headers: { location },
  }
}
`

interface ResponseOptions {
  fn?: string
  body?: string
  headers?: string
}

const r = (
  status: number,
  name: string,
  options: ResponseOptions = {}
): ResponseDef => ({
  status,
  name,
  fnName: options.fn ?? name[0].toLowerCase() + name.slice(1),
  defaultBodyType: options.body ?? 'undefined',
  defaultHeadersType: options.headers ?? 'undefined',
})

const redirectOpts = {
  body: 'string',
  headers: '{ location: string }',
}

const responses: ResponseDef[] = [
  r(100, 'Continue', { fn: 'continue_' }),
  r(101, 'SwitchingProtocols'),
  r(102, 'Processing'),
  r(103, 'EarlyHints'),

  r(200, 'Ok'),
  r(201, 'Created'),
  r(202, 'Accepted'),
  r(203, 'NonAuthoritativeInformation'),
  r(204, 'NoContent'),
  r(205, 'ResetContent'),
  r(206, 'PartialContent'),
  r(207, 'MultiStatus'),
  r(208, 'AlreadyReported'),
  r(226, 'IMUsed'),

  r(300, 'MultipleChoices'),
  r(301, 'MovedPermanently', redirectOpts),
  r(302, 'Found', redirectOpts),
  r(303, 'SeeOther', redirectOpts),
  r(304, 'NotModified'),
  r(305, 'UseProxy'),
  r(306, 'SwitchProxy'),
  r(307, 'TemporaryRedirect', redirectOpts),
  r(308, 'PermanentRedirect', redirectOpts),

  r(400, 'BadRequest'),
  r(401, 'Unauthorized'),
  r(402, 'PaymentRequired'),
  r(403, 'Forbidden'),
  r(404, 'NotFound'),
  r(405, 'MethodNotAllowed'),
  r(406, 'NotAcceptable'),
  r(407, 'ProxyAuthenticationRequired'),
  r(408, 'RequestTimeout'),
  r(409, 'Conflict'),
  r(410, 'Gone'),
  r(411, 'LengthRequired'),
  r(412, 'PreconditionFailed'),
  r(413, 'PayloadTooLarge'),
  r(414, 'URITooLong'),
  r(415, 'UnsupportedMediaType'),
  r(416, 'RangeNotSatisfiable'),
  r(417, 'ExpectationFailed'),
  r(418, 'ImATeapot'),
  r(421, 'MisdirectedRequest'),
  r(422, 'UnprocessableEntity'),
  r(423, 'Locked'),
  r(424, 'FailedDependency'),
  r(425, 'TooEarly'),
  r(426, 'UpgradeRequired'),
  r(428, 'PreconditionRequired'),
  r(429, 'TooManyRequests'),
  r(431, 'RequestHeaderFieldsTooLarge'),
  r(451, 'UnavailableForLegalReasons'),

  r(500, 'InternalServerError'),
  r(501, 'NotImplemented'),
  r(502, 'BadGateway'),
  r(503, 'ServiceUnavailable'),
  r(504, 'GatewayTimeout'),
  r(505, 'HTTPVersionNotSupported'),
]

process.stdout.write(header)
responses.forEach((r) => {
  process.stdout.write(generateCode(r))
})
process.stdout.write(footer)
