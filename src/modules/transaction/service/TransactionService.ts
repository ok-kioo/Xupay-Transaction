import { Prisma, TransactionStatus } from "@/infra/database/generated/client";
import { Socket } from "net";
import { ITransactionRepository } from "../domain/repository/ITransactionRepository";
import { ErrorHandler } from "@/infra/middleware/error/TcpError";
import { ResponseParser } from "@/infra/parser/ResponseParser";
import { TransactionServiceClient } from "./client/TransactionServiceClient";
import { TcpSocketClient } from "@/infra/client/TcpSocketClient";
import { JsonCodec } from "@/infra/parser/JsonCodec";
import { generatePix } from "@/infra/provider/pix/pix";
import { v4 as uuidv4 } from "uuid";

export class TransactionService {
  private readonly transactionServiceClient: TransactionServiceClient;

  constructor(
    private readonly transactionRepository: ITransactionRepository,
  ) {
    this.transactionServiceClient = new TransactionServiceClient(
      new TcpSocketClient(),
      process.env.CUSTOMER_SERVICE_HOST || " ",
      process.env.CUSTOMER_SERVICE_PORT || " "
    );
  }

  public async createTransaction(amount: Prisma.Decimal, pixKey: string, customerName: string, customerCity: string, customerId: string, socket: Socket): Promise<void> {
    if (!amount){
      return ErrorHandler.handle("Valor da transação é obrigatório para inclusão",socket);
    }

    if (!customerId){
      return ErrorHandler.handle("ID do cliente é obrigatório para inclusão",socket);
    }
    
    const pixCode = generatePix({
      key: pixKey,
      name: customerName,
      city: customerCity,
      amount: Number(amount),
      txid: uuidv4().replace(/-/g, "")
    });

    console.log("Pix code gerado:", pixCode);

    const transaction = await this.transactionRepository.create({ amount, customerId, pixCode });

    const responseBody = {
      id: transaction.id,
      amount: transaction.amount.toString(),
      status: transaction.status,
      customerId: transaction.customerId,
      createdAt: transaction.createdAt.toISOString()
    };

    const response = ResponseParser.serializeResponse(201, responseBody);
    socket.write(response);


    socket.end();
  }

  public async updateTransaction(id: string, customerId:string, payerEmail: string, socket: Socket): Promise<void> {
    if (!id) {
      return ErrorHandler
        .handle("ID da transação é obrigatório para atualização",socket);
    }

    if(!payerEmail){
      return ErrorHandler.handle("Email do pagador é obrigatório para atualização",socket);
    }

    const existingTransaction = await this.transactionRepository.findById(id);

    if (!existingTransaction) {
      return ErrorHandler.handle("Transação com este ID não encontrada",socket);
    }

    if(existingTransaction.status === TransactionStatus.COMPLETED){
      return ErrorHandler.handle("Transação concluída não pode ser atualizada",socket);
    }

    if(existingTransaction.customerId !== customerId){
      return ErrorHandler.handle("Transação não pertence a este cliente",socket);
    }

    const dataToUpdate: {
      status: TransactionStatus;
      payerEmail: string;
    } = {
      status: TransactionStatus.COMPLETED,
      payerEmail
    };

    const idempotencyKey = crypto.randomUUID();

    try {
      await this.transactionServiceClient.send("CUSTOMER_UPDATE", 
        idempotencyKey, 
        JsonCodec.stableStringify({id: existingTransaction.customerId, balance: existingTransaction.amount.toString()}));

    } catch (error) {      
      return ErrorHandler.handle("Erro ao atualizar saldo do cliente", socket);
    }

    const transaction = await this.transactionRepository.update(id, dataToUpdate);

    const responseBody = {
      id: transaction.id,
      amount: transaction.amount.toString(),
      status: transaction.status,
      customerId: transaction.customerId,
      createdAt: transaction.createdAt.toISOString(),

      ...(transaction.payerEmail && {
        payerEmail: transaction.payerEmail,
        pixCode: transaction.pixCode
      })
    };
    
    const response = ResponseParser.serializeResponse(200, responseBody);
    socket.write(response);
    socket.end();
  }

  public async deleteTransaction(id: string, customerId: string, socket: Socket): Promise<void> {
    if (!id) {
      return ErrorHandler.handle("ID da transação é obrigatório para exclusão",socket);
    }

    const existingTransaction = await this.transactionRepository.findById(id);

    if (!existingTransaction) {
      return ErrorHandler.handle("Transação com este ID não encontrada",socket);
    }

    if(existingTransaction.status === TransactionStatus.COMPLETED){
      return ErrorHandler.handle("Transação concluída não pode ser excluída",socket);
    }

    if(existingTransaction.customerId !== customerId){
      return ErrorHandler.handle("Transação não pertence a este cliente",socket);
    }

    const dataToUpdate: {
      status: TransactionStatus;
    } = {
      status: TransactionStatus.FAILED,
    };

    const transaction = await this.transactionRepository.update(id, dataToUpdate);

    const responseBody = {
      id: transaction.id,
      amount: transaction.amount.toString(),
      status: transaction.status,
      customerId: transaction.customerId,
      createdAt: transaction.createdAt.toISOString(),
    };

    const response = ResponseParser.serializeResponse(201, responseBody);
    socket.write(response);
    socket.end();
  }

  public async getTransaction(id: string, customerId: string, socket: Socket): Promise<void> {
    if (!id) {
      return ErrorHandler.handle("ID da transação é obrigatório para consulta",socket
      );
    }

    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      return ErrorHandler.handle("Transação com este ID não encontrada",socket);
    }

    if(transaction.customerId !== customerId){
      return ErrorHandler.handle("Transação não pertence a este cliente",socket);
    }
    
    const responseBody = {
      id: transaction.id,
      amount: transaction.amount.toString(),
      status: transaction.status,
      customerId: transaction.customerId,
      createdAt: transaction.createdAt.toISOString(),
      ...(transaction.payerEmail && {
        payerEmail: transaction.payerEmail
      })
    };

    const response = ResponseParser.serializeResponse(200, responseBody);
    socket.write(response);
    socket.end();

  }

  public async getTransactionHistory(customerId: string, socket: Socket): Promise<void> {
    if (!customerId) {
      return ErrorHandler.handle("CustomerId da transação é obrigatório para consulta",socket
      );
    }

    const transactions = await this.transactionRepository.findAllByCustomerId(customerId);

    if (!transactions.length) {
      return ErrorHandler.handle("Nenhuma transação encontrada para este cliente",socket);
    }

    const responseBody = {
      transactions: transactions.map((tx) => ({
        id: tx.id,
        amount: tx.amount.toString(),
        status: tx.status,
        payerEmail: tx.payerEmail ? tx.payerEmail : '',
        createdAt: tx.createdAt.toISOString(),

      }))
    };

    const response = ResponseParser.serializeResponse(200, responseBody);
    socket.write(response);
    socket.end();
  }
}