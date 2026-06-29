import type { JsonValue } from "./JsonValue";
import type { RequestHeaders } from "./TcpRequest";

export type Response = {
  statusCode: number;
  headers: RequestHeaders;
  body: {
    [key: string]: JsonValue;
  };
};
