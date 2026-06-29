import { UdpSocketClient } from "@/infra/client/UdpSocketClient";
import { ResponseParser } from "@/infra/parser/ResponseParser";

function parseRequiredPort(value: string | undefined, name: string): number {
  const parsedPort = Number.parseInt(value ?? "", 10);

  if (!Number.isInteger(parsedPort) || parsedPort < 0 || parsedPort > 65535) {
    throw new Error(`Invalid or missing port for ${name}`);
  }

  return parsedPort;
}

export class DNSServiceClient {
  constructor(
    private readonly socketClient: UdpSocketClient,
    private readonly dnsHost: string,
    private readonly dnsPort: string
  ) {}

  public async CreateDNS(): Promise<void> {
    const request = this.buildCreateDNSRequest();

    console.log(`Enviando requisição para criar registro DNS: ${request}`);

    const rawResponse = await this.socketClient.send(
        this.dnsHost,
        parseRequiredPort(this.dnsPort, "dnsPort"),
        request
    );
    
    if (!rawResponse) {
      console.log("Falha ao receber resposta do serviço DNS");
    }

  }

  private buildCreateDNSRequest(): string {
    return ResponseParser.serialize({
      method: "POST",
      path: "create",
      service: process.env.XUPAY_SERVICE_NAME || "xupay-service-registry",
      secret: process.env.XUPAY_SERVICE_SECRET,
      body: {
        ip: process.env.XUPAY_SERVICE_HOST || "",
        domain: process.env.XUPAY_SERVICE_DOMAIN || "",
        port: "3500"
      },
    });
  }
}