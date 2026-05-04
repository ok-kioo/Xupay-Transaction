import { isValidBodyRequest, Request } from '@/@types/contracts/Request';
import { TransactionService } from '../service/TransactionService';
import { ErrorHandler } from '@/infra/middleware/Error';

export class TransactionController {
    constructor(
        private transactionService: TransactionService
    ) {}

    public createTransaction(request: Request, socket: any): void {
        const messageBody = isValidBodyRequest(request.body, socket);

        if (!messageBody){
            return ErrorHandler.handle('Corpo da requisição inválido', socket);
        }

        if(messageBody.payload.kind !== "CREATE_TRANSACTION_PAYLOAD"){
            return ErrorHandler.handle('Payload inválido para criação de transação', socket);
        }

        this.transactionService.createTransaction(messageBody.payload.amount, messageBody.payload.customerId, socket);
    }

    public updateTransaction(request: Request, socket: any): void {
        const messageBody = isValidBodyRequest(request.body, socket);
        if (!messageBody){
            return ErrorHandler.handle('Corpo da requisição inválido', socket);
        }
        if(messageBody.payload.kind !== "UPDATE_TRANSACTION_PAYLOAD"){
            return ErrorHandler.handle('Payload inválido para atualização de transação', socket);
        }
        this.transactionService.updateTransaction(messageBody.payload.id, messageBody.payload.status, socket);
    }
    
    public deleteTransaction(request: Request, socket: any): void {
        const messageBody = isValidBodyRequest(request.body, socket);

        if (!messageBody){
            return ErrorHandler.handle('Corpo da requisição inválido', socket);
        }

        if(messageBody.payload.kind !== "DELETE_TRANSACTION_PAYLOAD"){
            return ErrorHandler.handle('Payload inválido para exclusão de transação', socket);
        }

        this.transactionService.deleteTransaction(messageBody.payload.id, socket);
    }

    public getTransaction(request: Request, socket: any): void {
        const messageBody = isValidBodyRequest(request.body, socket);

        if (!messageBody){
            return ErrorHandler.handle('Corpo da requisição inválido', socket);
        }

        if(messageBody.payload.kind !== "GET_TRANSACTION_PAYLOAD"){
            return ErrorHandler.handle('Payload inválido para obtenção de transação', socket);
        }

        this.transactionService.getTransaction(messageBody.payload.customerId, socket);
    }

}