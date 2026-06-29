import dgram from "dgram";
import { JsonCodec } from "../../parser/JsonCodec";

export class ErrorHandler {
  public static handle(
    err: string,
    server: dgram.Socket,
    rinfo: dgram.RemoteInfo
  ): void {
    const body = JsonCodec.stringify({ error: err });

    const message =
      `HTTP/1.1 400 Error\r\n` +
      `Content-Type: application/json\r\n` +
      `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n` +
      body;

    server.send(
      message,
      rinfo.port,
      rinfo.address,
      (error) => {
        if (error) {
          console.error("error:", error);
        }
      }
    );
  }
}