import { isValidRequest, Request } from '@/@types/contracts/UdpRequest';
import { ErrorHandler } from '@/infra/middleware/error/TcpError';
import { HealthService } from '../service/HealthService';


export class HealthController {
    constructor(
        private healthService: HealthService
    ) {}

    public health(request: Request, socket: any, rinfo: any): void {
        const validRequest = isValidRequest(request, socket, rinfo);

        if (!validRequest){
            return;
        }

        const payload = request.body.payload;

        if (payload.kind !== "HEALTH_PAYLOAD") {
            ErrorHandler.handle('Corpo da requisição inválido', socket);
        }

        this.healthService.health(socket, rinfo);
    }
}