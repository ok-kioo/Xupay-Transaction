import { Prisma } from "@/infra/database/generated/client";
import { Socket } from "net";
import { ITransactionRepository } from "../domain/repository/ITransactionRepository";
import { ErrorHandler } from "@/infra/middleware/Error";
import { ResponseParser } from "@/infra/parser/ResponseParser";
import { CustomerServiceClient } from "./client/TransactionServiceClient";
import { SocketClient } from "@/infra/client/SocketClient";
import { JsonCodec } from "@/infra/parser/JsonCodec";

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
    
    const transaction = await this.transactionRepository.create({ amount, customerId });

    const responseBody = {
      id: transaction.id,
      amount: transaction.amount.toString(),
      status: transaction.status,
      customerId: transaction.customerId,
      createdAt: transaction.createdAt.toISOString()
    };
    
    const response = ResponseParser.serializeResponse(201, responseBody);
    socket.write(response);

    this.customerServiceClient.send("CUSTOMER_UPDATE", JsonCodec.stableStringify({balance: amount, customerId: customerId}));
 
    socket.end();
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

    const transaction = await this.transactionRepository.update(id, { status });

    const responseBody = {
      id: transaction.id,
      amount: transaction.amount.toString(),
      status: transaction.status,
      customerId: transaction.customerId,
      createdAt: transaction.createdAt.toISOString()
    };
    
    const response = ResponseParser.serializeResponse(200, responseBody);
    socket.write(response);
    socket.end();
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

    const response = ResponseParser.serializeResponse(204, {});
    socket.write(response);
    socket.end();
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

    const responseBody = {
      id: transaction.id,
      amount: transaction.amount.toString(),
      status: transaction.status,
      customerId: transaction.customerId,
      createdAt: transaction.createdAt.toISOString()
    };
    
    const response = ResponseParser.serializeResponse(200, responseBody);
    socket.write(response);
    socket.end();

  }
}