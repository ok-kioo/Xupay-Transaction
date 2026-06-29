import { ResponseParser } from "@/infra/parser/ResponseParser";

export class HealthService {
    constructor() {}

    public async health(socket: any, rinfo: any): Promise<void> {
        const responseBody = {
            health:"OK"
        };
        
        const response = ResponseParser.serializeResponse(200, responseBody);

        socket.send(Buffer.from(response), rinfo.port, rinfo.address);
        socket.close();
    }
}