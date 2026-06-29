import dgram from 'dgram';
import { ResponseParser } from '../../parser/ResponseParser';
import { ErrorHandler } from '../error/UdpError';
import { UdpRoutes } from '../../../routes/UdpRoutes';

export function startUdpServer(routes: UdpRoutes): void {
    const server = dgram.createSocket('udp4');

    server.on('message', (msg: Buffer, rinfo: dgram.RemoteInfo) => {
        try{
            const request = ResponseParser.deserialize(msg.toString());

            if (!request) {
                throw new Error("Requisição mal formatada " + msg.toString());
            }

            routes.handle(request, server, rinfo);
            
        } catch (error) {
            return ErrorHandler.handle("Erro ao processar requisição", server, rinfo);
        }
    });

    server.on('listening', ()=>{
        const adress = server.address();
        console.log(`Servidor de processamento rodando na porta ${adress.port}`)
    });

    server.bind(3501);
}