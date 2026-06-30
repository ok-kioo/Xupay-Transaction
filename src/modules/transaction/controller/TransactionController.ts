import { isValidRequest, Request } from '@/@types/contracts/TcpRequest';
import { TransactionService } from '../service/TransactionService';
import { ErrorHandler } from '@/infra/middleware/error/TcpError';
import { CreateTransactionPayload } from '@/@types/contracts/payload/CreateTransactionPayload';
import { UpdateTransactionPayload } from '@/@types/contracts/payload/UpdateTransactionPayload';
import { DeleteTransactionPayload } from '@/@types/contracts/payload/DeleteTransactionPayload';
import { GetTransactionPayload } from '@/@types/contracts/payload/GetTransactionPayload';
import { GetHistoryTransactionPayload } from '@/@types/contracts/payload/GetHistoryTransactionPayload copy';

export class TransactionController {
    constructor(
        private transactionService: TransactionService
    ) {}

    public createTransaction(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest){
            return;
        }

        const payload = request.body.payload;

        const { amount, pixKey, customerName, customerCity, customerId } = payload as CreateTransactionPayload;

        this.transactionService.createTransaction(amount, pixKey, customerName, customerCity, customerId, socket);
    }

    public updateTransaction(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest){
            return ErrorHandler.handle('Corpo da requisição inválido', socket);
        }
        
        const payload = request.body.payload;

        const { id, customerId, payerEmail } = payload as UpdateTransactionPayload;

        this.transactionService.updateTransaction(id, customerId, payerEmail, socket);
    }
    
    public deleteTransaction(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest){
            return ErrorHandler.handle('Corpo da requisição inválido', socket);
        }

        const payload = request.body.payload;

        const { id, customerId } = payload as DeleteTransactionPayload;

        this.transactionService.deleteTransaction(id, customerId, socket);
    }

    public getTransaction(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest){
            return ErrorHandler.handle('Corpo da requisição inválido', socket);
        }

        const payload = request.body.payload;

        const { id, customerId } = payload as GetTransactionPayload;

        this.transactionService.getTransaction(id, customerId, socket);
    }

    public getTransactionHistory(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest){
            return ErrorHandler.handle('Corpo da requisição inválido', socket);
        }

        const payload = request.body.payload;

        const { customerId } = payload as GetHistoryTransactionPayload;

        this.transactionService.getTransactionHistory(customerId, socket);
    }

}