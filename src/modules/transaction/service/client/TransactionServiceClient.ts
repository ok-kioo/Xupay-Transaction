import { SocketClient } from "@/infra/client/SocketClient";
import { ResponseParser } from "@/infra/parser/ResponseParser";

export class CustomerServiceClient {
  constructor(
    private readonly socketClient: SocketClient,
    private readonly serviceHost: string,
    private readonly servicePort: number
  ) {}

  public async send(event: string, idempotencyKey: string, apiPayload: string): Promise<void> {
    const request = this.buildSendRequest(event, idempotencyKey, apiPayload);

    await this.socketClient.send(
      this.serviceHost,
      this.servicePort,
      request
    );
    }

  private buildSendRequest(event:string, idempotencyKey: string, apiPayload: string): string {
    return ResponseParser.serialize({
      method: 'POST',
      path: 'publish',
      service: process.env.XUPAY_SERVICE_NAME || "xupay-transaction-service",
      secret: process.env.XUPAY_SERVICE_SECRET,
      body: {
        event:event,
        idempotencyKey: idempotencyKey,
        apiPayload: apiPayload,
        timestamp: new Date().toISOString()
      }
    });
  }
}