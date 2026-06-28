import {
  createRequestSignature,
  normalizePath,
} from "@/@types/contracts/Request";
import type { Request, RequestHeaders } from "@/@types/contracts/Request";
import type { CreateTransactionPayload } from "@/@types/contracts/payload/CreateTransactionPayload";
import type { GetTransactionPayload } from "@/@types/contracts/payload/GetTransactionPayload";
import type { UpdateTransactionPayload } from "@/@types/contracts/payload/UpdateTransactionPayload";
import type { DeleteTransactionPayload } from "@/@types/contracts/payload/DeleteTransactionPayload";

import type { JsonValue } from "@/@types/contracts/JsonValue";
import { JsonCodec } from "./JsonCodec";
import type { JsonObject } from "./JsonCodec";
import { Prisma } from "@/infra/database/generated/client";

type ParsedPayload =
  | CreateTransactionPayload
  | GetTransactionPayload
  | UpdateTransactionPayload
  | DeleteTransactionPayload

type SerializableRequest = {
  method: string;
  path: string;
  headers?: RequestHeaders;
  body: JsonObject;
  service?: string;
  secret?: string;
};

export class ResponseParser {
  public static deserialize(rawRequest: string): Request {
    const request = rawRequest.trim();

    if (!this.isHttpRequest(request)) {
      throw new Error("Protocolo inválido. Esperado HTTP/1.1 ou HTTP/1.0");
    }

    return this.deserializeHttpRequest(request);
  }

  public static serialize(request: SerializableRequest): string {
    const method = request.method.toUpperCase();
    const path = normalizePath(request.path);
    const rawBody = JsonCodec.stringify(request.body);
    const headers: RequestHeaders = {
      host: "xupay-service-registry",
      "content-type": "application/json",
      "content-length": Buffer.byteLength(rawBody).toString(),
      ...this.normalizeHeaders(request.headers || {}),
    };

    if (request.service && request.secret) {
      headers["x-xupay-service"] = request.service;
      headers["x-xupay-signature"] = createRequestSignature(
        method,
        path,
        rawBody,
        request.secret
      );
    }

    const headerLines = Object.entries(headers).map(
      ([key, value]) => `${this.toHttpHeaderName(key)}: ${value}`
    );

    return `${method} /${path} HTTP/1.1\r\n${headerLines.join(
      "\r\n"
    )}\r\n\r\n${rawBody}`;
  }

  public static serializeResponse(statusCode: number, body: JsonObject): string {
    const statusText = statusCode >= 400 ? "Error" : "OK";
    const rawBody = JsonCodec.stringify(body);

    return `HTTP/1.1 ${statusCode} ${statusText}\r\nContent-Type: application/json\r\nContent-Length: ${Buffer.byteLength(
      rawBody
    )}\r\n\r\n${rawBody}`;
  }

  private static isHttpRequest(request: string): boolean {
    return /^[A-Z]+ \S+ HTTP\/1\.[01]/.test(request);
  }

  private static deserializeHttpRequest(rawRequest: string): Request {
    const separator = rawRequest.indexOf("\r\n\r\n");

    if (separator === -1) {
      throw new Error("Requisição HTTP sem separador entre headers e body");
    }

    const headerPart = rawRequest.slice(0, separator);
    const rawBody = rawRequest.slice(separator + 4);
    const [requestLine, ...headerLines] = headerPart.split("\r\n");
    const [method, rawPath] = requestLine.split(" ");
    const headers = this.parseHeaders(headerLines);
    const parsedBody = this.parseJsonObject(rawBody);
    const path = normalizePath(rawPath);
    const body = this.parseMessageBody(path, parsedBody);

    return {
      method: method.toUpperCase(),
      path,
      headers,
      body,
      rawBody,
    };
  }

  private static parseMessageBody(
    path: string,
    body: JsonObject
  ): Request["body"] {
    return {
      payload: this.parsePayloadByPath(path, body),
    };
  }

  private static parsePayloadByPath(
    path: string,
    body: JsonObject
  ): ParsedPayload {
    const payload = this.extractPayloadObject(body);

    if (path === "") {
      return this.parseGetPayload(payload);
    }

    if (path === "create") {
      return this.parseCreatePayload(payload);
    }

    if (path === "update") {
      return this.parseUpdatePayload(payload);
    }

    if (path === "delete") {
      return this.parseDeletePayload(payload);
    }

    return this.parseGetPayload(payload);
  }

  private static extractPayloadObject(body: JsonObject): JsonObject {
    const nestedPayload = body.payload;

    if (JsonCodec.isJsonObject(nestedPayload)) {
      return nestedPayload;
    }

    return body;
  }

  private static parseGetPayload(
    payload: JsonObject
  ): GetTransactionPayload {
    return {
      kind: "GET_TRANSACTION_PAYLOAD",
      customerId: this.requiredString(payload.customerId, "customerId"),
    };
  }

  private static parseCreatePayload(
    payload: JsonObject
  ): CreateTransactionPayload {
    return {
      kind: "CREATE_TRANSACTION_PAYLOAD",
      amount: this.requiredDecimal(payload.amount, "amount"),
      pixKey: this.requiredString(payload.pixKey, "pixKey"),
      customerName: this.requiredString(payload.customerName, "customerName"),
      customerCity: this.requiredString(payload.customerCity, "customerCity"),
      customerId: this.requiredString(payload.customerId, "customerId"),
    };
  }

  private static parseUpdatePayload(
    payload: JsonObject
  ): UpdateTransactionPayload {
    return {
      kind: "UPDATE_TRANSACTION_PAYLOAD",
      id: this.requiredString(payload.id, "id"),
      payerEmail: this.requiredString(payload.payerEmail, "payerEmail"),
    };
  }

  private static parseDeletePayload(
    payload: JsonObject
  ): DeleteTransactionPayload {
    return {
      kind: "DELETE_TRANSACTION_PAYLOAD",
      id: this.requiredString(payload.id, "id"),
    };
  }

  private static requiredDecimal(
  value: JsonValue | undefined,
  fieldName: string
): Prisma.Decimal {
  if (typeof value === "number") {
    return new Prisma.Decimal(value);
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (!normalized) {
      throw new Error(`Payload inválido. Campo ${fieldName} ausente.`);
    }

    try {
      return new Prisma.Decimal(normalized);
    } catch {
      throw new Error(`Payload inválido. Campo ${fieldName} não é um decimal válido.`);
    }
  }

  throw new Error(`Payload inválido. Campo ${fieldName} ausente.`);
}

  private static optionalString(value: JsonValue | undefined): string | undefined {
    return typeof value === "string" ? value : undefined;
  }

  private static requiredString(
    value: JsonValue | undefined,
    fieldName: string
  ): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`Payload inválido. Campo ${fieldName} ausente.`);
    }

    return value.trim();
  }

  private static parseHeaders(headerLines: string[]): RequestHeaders {
    const headers: RequestHeaders = {};

    for (const line of headerLines) {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim().toLowerCase();
      const value = line.slice(separatorIndex + 1).trim();

      if (key) {
        headers[key] = value;
      }
    }

    return headers;
  }

  private static parseJsonObject(rawBody: string): JsonObject {
    return JsonCodec.parseObject(rawBody);
  }

  private static normalizeHeaders(headers: RequestHeaders): RequestHeaders {
    const normalizedHeaders: RequestHeaders = {};

    for (const [key, value] of Object.entries(headers)) {
      normalizedHeaders[key.toLowerCase()] = value;
    }

    return normalizedHeaders;
  }

  private static toHttpHeaderName(header: string): string {
    return header
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("-");
  }
}
