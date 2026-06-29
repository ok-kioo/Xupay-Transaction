import { TcpSocketClient } from "@/infra/client/TcpSocketClient";
import { UdpSocketClient } from "@/infra/client/UdpSocketClient";
import { DNSServiceClient } from "@/modules/health/service/client/DNSServiceClient";
import { ServiceRegistryClient } from "@/modules/transaction/service/client/ServiceRegistryClient";

enum TransactionEvents {
    CREATE_TRANSACTION = "/create",
    UPDATE_TRANSACTION = "/update",
    GET_TRANSACTION = "",
    DELETE_TRANSACTION = "/delete"
}

export class TransactionWorker {
  private readonly dnsServiceClient: DNSServiceClient;
  private readonly serviceRegistryClient: ServiceRegistryClient;

  constructor() {
    this.dnsServiceClient = new DNSServiceClient(
      new UdpSocketClient(),
      process.env.DNS_SERVICE_HOST || " ",
      process.env.DNS_SERVICE_PORT || " "
    );

    this.serviceRegistryClient = new ServiceRegistryClient(
      new TcpSocketClient(),
      process.env.SERVICE_REGISTRY_HOST || " ",
      process.env.SERVICE_REGISTRY_PORT || " "
    );
  }

  public async registerService(): Promise<void> {
    try {
      this.dnsServiceClient.CreateDNS();

      const domain = process.env.XUPAY_SERVICE_DOMAIN || "";

      for (const [key, value] of Object.entries(TransactionEvents)) {
        await this.serviceRegistryClient.send(
            domain,
            key,
            value
        );
      }
    } catch (error) {
        
        console.error("Erro ao registrar o serviço:", error);
    }
  }
  
}