import { Prisma } from "@/infra/database/generated/client";
import { Socket } from "net";
import { ITransactionRepository } from "../domain/repository/ITransactionRepository";
import { ErrorHandler } from "@/infra/middleware/Error";
import { ResponseParser } from "@/infra/parser/ResponseParser";
import { CustomerServiceClient } from "./client/CustomerServiceClient";
import { SocketClient } from "@/infra/client/SocketClient";

export class TransactionService {
  private readonly customerServiceClient: CustomerServiceClient;

  constructor(
    private readonly transactionRepository: ITransactionRepository,
    
  ) {
    this.customerServiceClient = new CustomerServiceClient(
      new SocketClient(),
      process.env.CUSTOMER_SERVICE_HOST || " ",
      parseInt(process.env.CUSTOMER_SERVICE_PORT || " ")
    );
  }

  public async createTransaction(amount: Prisma.Decimal, customerId: string, socket: Socket): Promise<void> {
    if (!amount){
      return ErrorHandler.handle("Valor da transação é obrigatório para inclusão",socket);
    }

    if (!customerId){
      return ErrorHandler.handle("ID do cliente é obrigatório para inclusão",socket);
    }

    const payload = 'amount=' + amount.toString() + ',customerId=' + customerId;

    this.customerServiceClient.send("customer-update", payload);

    await this.transactionRepository.create({ amount, customerId });
  }

  public async updateTransaction(id: string, status: string, socket: Socket): Promise<void> {
    if (!id) {
      return ErrorHandler
        .handle("ID da transação é obrigatório para atualização",socket);
    }

    const existingTransaction = await this.transactionRepository.findById(id);

    if (!existingTransaction) {
      return ErrorHandler.handle("Transação com este ID não encontrada",socket);
    }

    await this.transactionRepository.update(id, { status });
  }

  public async deleteTransaction(id: string, socket: Socket): Promise<void> {
    if (!id) {
      return ErrorHandler.handle("ID da transação é obrigatório para exclusão",socket);
    }

    const existingTransaction = await this.transactionRepository.findById(id);

    if (!existingTransaction) {
      return ErrorHandler.handle("Transação com este ID não encontrada",socket);
    }

    await this.transactionRepository.delete(id);
  }

  public async getTransaction(id: string, socket: Socket): Promise<void> {
    if (!id) {
      return ErrorHandler.handle("ID da transação é obrigatório para consulta",socket
      );
    }

    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      return ErrorHandler.handle("Transação com este ID não encontrada",socket);
    }

    const payload = 'id=' + transaction.id + ',amount=' + transaction.amount.toString() + ',status=' + transaction.status + ',customerId=' + transaction.customerId+',createdAt=' + transaction.createdAt.toISOString();

    const response = ResponseParser.serialize({
            method: "GET",
            path: "transaction",
            body: {
                source: "SERVICE",
                type: "RESPONSE",
                payload: payload,
                timestamp: new Date().toISOString()
            }
        });

        socket.write(response);
        socket.end();

  }
}