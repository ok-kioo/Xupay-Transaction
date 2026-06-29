import net from 'net';
import { ResponseParser } from '../../parser/ResponseParser';
import { ErrorHandler } from '../error/TcpError';
import { TcpRoutes } from '../../../routes/TcpRoutes';

export function startTcpServer(routes: TcpRoutes): void {

    const server = net.createServer((socket: net.Socket) => {
        console.log('Cliente conectado');

        socket.on('data', (data: Buffer) => {
            console.log('Recebido');
            
            try{
                const request = ResponseParser.deserialize(data.toString());

                if (!request) {
                    throw new Error("Requisição mal formatada " + data.toString());
                }

                routes.handle(request, socket);
                
            } catch (error) {
                console.log("Erro ao processar requisição:", error);
                return ErrorHandler.handle("Erro ao processar requisição", socket);
            }

        });

        socket.on('end', () => {
            console.log('Cliente desconectado');
        });
    });

    server.listen(3500, () => {
        console.log('Servidor de processamento rodando na porta 3500');
    });
}