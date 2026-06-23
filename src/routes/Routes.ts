import { Socket } from "net";
import type { Request } from "../@types/contracts/Request";
import { ErrorHandler } from "../infra/middleware/Error";
import { TransactionService } from "@/modules/transaction/service/TransactionService";
import { TransactionController } from "@/modules/transaction/controller/TransactionController";
import { TransactionRepositoryImpl } from "@/modules/transaction/domain/repository/TransactionRepositoryImpl";

export class Routes {
    private transactionRepository: TransactionRepositoryImpl;
    private transactionController: TransactionController;
    private transactionService: TransactionService;

    constructor() {
        this.transactionRepository = new TransactionRepositoryImpl();
        this.transactionService = new TransactionService(this.transactionRepository);
        this.transactionController = new TransactionController(this.transactionService);

    }

    public handle(request: Request, socket: Socket): void {
        if (request.path === "transaction-create" && request.method === "POST") {
            this.transactionController.createTransaction(request, socket);
        }
        else if (request.path === "transaction-delete" && request.method === "DELETE") {
            this.transactionController.deleteTransaction(request, socket);
        }
        else if (request.path === "transaction-update" && request.method === "PUT") {
            this.transactionController.updateTransaction(request, socket);
        }
        else if (request.path === "transaction" && request.method === "GET") {
            this.transactionController.getTransaction(request, socket);
        }
        else {
            return ErrorHandler.handle('Rota não encontrada', socket);
        }
        
    }
}