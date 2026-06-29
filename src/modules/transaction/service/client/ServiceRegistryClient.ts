import { TcpSocketClient } from "@/infra/client/TcpSocketClient";
import { ResponseParser } from "@/infra/parser/ResponseParser";

function parseRequiredPort(value: string | undefined, name: string): number {
  const parsedPort = Number.parseInt(value ?? "", 10);

  if (!Number.isInteger(parsedPort) || parsedPort < 0 || parsedPort > 65535) {
    throw new Error(`Invalid or missing port for ${name}`);
  }

  return parsedPort;
}

export class ServiceRegistryClient {
  constructor(
    private readonly socketClient: TcpSocketClient,
    private readonly serviceRegistryHost: string,
    private readonly serviceRegistryPort: string
  ) {}

  public async send(instanceName: string, event: string, path: string): Promise<void> {
    const request = this.buildSendRequest(instanceName, event, path);

    await this.socketClient.send(
      this.serviceRegistryHost,
      parseRequiredPort(this.serviceRegistryPort, "serviceRegistryPort"),
      request
    );
  }

  private buildSendRequest(instanceName: string, event: string, path: string): string {
    return ResponseParser.serialize({
      method: 'POST',
      path: 'create',
      service: process.env.XUPAY_SERVICE_NAME || "xupay-transaction-service",
      secret: process.env.XUPAY_SERVICE_SECRET,
      body: {
        instanceName: instanceName,
        event: event,
        path: path
      }
    });
  }
}