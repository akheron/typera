import * as t from "io-ts";
import * as Koa from "koa";
import "koa-bodyparser"; // Adds `.body` and `.rawBody` to ctx.request

// Basic request and response types

export interface Request<RequestParams, RequestQuery, RequestBody> {
  params: RequestParams;
  query: RequestQuery;
  body: RequestBody;
  ctx: Koa.Context;
}

export type GenericResponse = {
  status: number;
  body: any;
};

export type Ok<ResponseBody = undefined> = {
  status: 200;
  body: ResponseBody;
};

export type Created<ResponseBody = undefined> = {
  status: 201;
  body: ResponseBody;
};

export type NoContent = {
  status: 204;
  body: undefined;
};

export type BadRequest<ResponseBody = undefined> = {
  status: 400;
  body: ResponseBody;
};

export type NotFound<ResponseBody = undefined> = {
  status: 404;
  body: ResponseBody;
};

export const ok = <ResponseBody>(body: ResponseBody): Ok<ResponseBody> => ({
  status: 200,
  body
});

export const created = <ResponseBody>(
  body: ResponseBody
): Created<ResponseBody> => ({
  status: 201,
  body
});

export const noContent = (): NoContent => ({ status: 204, body: undefined });

export const badRequest = <ResponseBody>(
  body: ResponseBody
): BadRequest<ResponseBody> => ({ status: 400, body });

export const notFound = <ResponseBody>(
  body: ResponseBody
): NotFound<ResponseBody> => ({ status: 404, body });

// A request handler takes a request and produces a response

export type RequestHandler<
  RequestParams,
  RequestQuery,
  RequestBody,
  Response
> = (
  request: Request<RequestParams, RequestQuery, RequestBody>
) => Promise<Response>;

// Codecs validate the input (path params, query params, request body)

interface RequestCodecs {
  params?: t.Type<any, any, any>;
  query?: t.Type<any, any, any>;
  body?: t.Type<any, any, any>;
}

type CodecType<
  K extends keyof RequestCodecs,
  Codecs extends RequestCodecs
> = Codecs[K] extends t.Type<infer T, any, any> ? T : undefined;

// Create a route handler from a function that takes a request and
// returns a response

export const routeHandler = <Codecs extends RequestCodecs, Response>(
  codecs: Codecs,
  handler: RequestHandler<
    CodecType<"params", Codecs>,
    CodecType<"query", Codecs>,
    CodecType<"body", Codecs>,
    Response
  >
) => async (ctx: Koa.Context): Promise<Response> => {
  const params = codecs.params
    ? codecs.params.decode(ctx.params).getOrElseL(() => ctx.throw(404))
    : undefined;
  const query = codecs.query
    ? codecs.query
        .decode(ctx.request.query)
        .getOrElseL(() => ctx.throw(400, "Invalid query"))
    : undefined;
  const body = codecs.body
    ? codecs.body
        .decode(ctx.request.body)
        .getOrElseL(() => ctx.throw(400, "Invalid body"))
    : undefined;

  const request = {
    params,
    query,
    body,
    ctx
  };
  return handler(request);
};

// Turn a route handler to a koa-router's route callback

export type RouteHandler<Response extends GenericResponse> = (
  ctx: Koa.Context
) => Promise<Response>;

export const run = <Response extends GenericResponse>(
  handler: RouteHandler<Response>
) => async (ctx: Koa.Context): Promise<void> => {
  const response = await handler(ctx);
  ctx.response.status = response.status;
  ctx.response.body = response.body;
};
