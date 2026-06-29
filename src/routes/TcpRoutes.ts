import { Socket } from "net";
import type { Request } from "../@types/contracts/TcpRequest";
import { ErrorHandler } from "../infra/middleware/error/TcpError";
import { TransactionService } from "@/modules/transaction/service/TransactionService";
import { TransactionController } from "@/modules/transaction/controller/TransactionController";
import { TransactionRepositoryImpl } from "@/modules/transaction/domain/repository/TransactionRepositoryImpl";

export class TcpRoutes {
    private transactionRepository: TransactionRepositoryImpl;
    private transactionController: TransactionController;
    private transactionService: TransactionService;

    constructor() {
        this.transactionRepository = new TransactionRepositoryImpl();
        this.transactionService = new TransactionService(this.transactionRepository);
        this.transactionController = new TransactionController(this.transactionService);

    }

    public handle(request: Request, socket: Socket): void {
        if (request.path === "create" && request.method === "POST") {
            this.transactionController.createTransaction(request, socket);
        }
        else if (request.path === "delete" && request.method === "DELETE") {
            this.transactionController.deleteTransaction(request, socket);
        }
        else if (request.path === "update" && request.method === "PUT") {
            this.transactionController.updateTransaction(request, socket);
        }
        else if (request.path === "" && request.method === "GET") {
            this.transactionController.getTransaction(request, socket);
        }
        else {
            return ErrorHandler.handle('Rota não encontrada', socket);
        }
        
    }
}