import { SocketClient } from "@/infra/client/SocketClient";

export class CustomerServiceClient {
  constructor(
    private readonly socketClient: SocketClient,
    private readonly serviceHost: string,
    private readonly servicePort: number
  ) {}

  public async send(service: string, apiPayload: string): Promise<void> {
    const request = this.buildSendRequest(service, apiPayload);

    await this.socketClient.send(
      this.serviceHost,
      this.servicePort,
      request
    );
    }

  private buildSendRequest(service: string, apiPayload: string): string {
    const payload = `service=${service},apiPayload=${apiPayload}`;

    return `POST|publish|SERVICE;REQUEST;${payload};${new Date().toISOString()}`;
  }
}