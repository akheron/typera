// Run `yarn generate-responses` to generate src/response.ts

const header = `\
// This file is generated, do not edit! See ../tools/generate-responses.ts

namespace Response {
  type OptionalHeaders = { [key: string]: string } | undefined

  export type Response<Status, Body, Headers extends OptionalHeaders> = {
    status: Status
    body: Body
    headers: Headers
  }

  export type Generic = Response<number, any, undefined>

`

const footer = `\
}

export default Response
`

type ResponseDef = {
  status: number
  name: string
  fnName: string
}

const generateCode = ({ status, name, fnName }: ResponseDef): string => `\
  export type ${name}<Body = undefined, Headers extends OptionalHeaders = undefined> = Response<${status}, Body, Headers>
  export function ${fnName}<Body, Headers extends OptionalHeaders>(body: Body, headers: Headers): ${name}<Body, Headers>
  export function ${fnName}<Body>(body: Body): ${name}<Body>
  export function ${fnName}(): ${name}
  export function ${fnName}(body = undefined, headers = undefined) {
    return { status: ${status}, body, headers }
  }

`

const r = (status: number, name: string, fnName?: string): ResponseDef => ({
  status,
  name,
  fnName: fnName || name[0].toLowerCase() + name.slice(1),
})

const responses: ResponseDef[] = [
  r(100, 'Continue', 'continue_'),
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
  r(301, 'MovedPermanently'),
  r(302, 'Found'),
  r(303, 'SeeOther'),
  r(304, 'NotModified'),
  r(305, 'UseProxy'),
  r(306, 'SwitchProxy'),
  r(307, 'TemporaryRedirect'),
  r(308, 'PermanentRedirect'),

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
]

process.stdout.write(header)
responses.forEach(r => {
  process.stdout.write(generateCode(r))
})
process.stdout.write(footer)
