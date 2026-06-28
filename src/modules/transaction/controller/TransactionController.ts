import { isValidRequest, Request } from '@/@types/contracts/Request';
import { TransactionService } from '../service/TransactionService';
import { ErrorHandler } from '@/infra/middleware/Error';
import { CreateTransactionPayload } from '@/@types/contracts/payload/CreateTransactionPayload';
import { UpdateTransactionPayload } from '@/@types/contracts/payload/UpdateTransactionPayload';
import { DeleteTransactionPayload } from '@/@types/contracts/payload/DeleteTransactionPayload';
import { GetTransactionPayload } from '@/@types/contracts/payload/GetTransactionPayload';

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

        const { id, status, payerEmail } = payload as UpdateTransactionPayload;

        this.transactionService.updateTransaction(id, { status, payerEmail }, socket);
    }
    
    public deleteTransaction(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest){
            return ErrorHandler.handle('Corpo da requisição inválido', socket);
        }

        const payload = request.body.payload;

        const { id } = payload as DeleteTransactionPayload;

        this.transactionService.deleteTransaction(id, socket);
    }

    public getTransaction(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest){
            return ErrorHandler.handle('Corpo da requisição inválido', socket);
        }

        const payload = request.body.payload;

        const { customerId } = payload as GetTransactionPayload;

        this.transactionService.getTransaction(customerId, socket);
    }

}