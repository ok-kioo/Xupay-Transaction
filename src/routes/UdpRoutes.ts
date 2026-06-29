import dgram from 'dgram';
import type { Request } from "../@types/contracts/TcpRequest";
import { ErrorHandler } from "../infra/middleware/error/UdpError";
import { HealthService } from '@/modules/health/service/HealthService';
import { HealthController } from '@/modules/health/controller/HealthController';

export class UdpRoutes {
    private readonly healthController: HealthController;
    private readonly healthService: HealthService;
    constructor() {
        this.healthService = new HealthService();
        this.healthController = new HealthController(this.healthService);
    }

    public handle(request: Request, socket: dgram.Socket, rinfo: dgram.RemoteInfo): void {
        if (request.path === "health" && request.method === "GET") {
            this.healthController.health(request, socket, rinfo);
        }
        
        else {
            return ErrorHandler.handle('Rota não encontrada', socket, rinfo);
        }
        
    }
}