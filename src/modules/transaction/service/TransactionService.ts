import { Prisma, TransactionStatus } from "@/infra/database/generated/client";
import { Socket } from "net";
import { ITransactionRepository } from "../domain/repository/ITransactionRepository";
import { ErrorHandler } from "@/infra/middleware/Error";
import { ResponseParser } from "@/infra/parser/ResponseParser";
import { CustomerServiceClient } from "./client/TransactionServiceClient";
import { SocketClient } from "@/infra/client/SocketClient";
import { JsonCodec } from "@/infra/parser/JsonCodec";
import { generatePix } from "@/infra/provider/pix/pix";
import { v4 as uuidv4 } from "uuid";

type UpdateTransactionData = {
  status: string|undefined,
  payerEmail: string|undefined
};

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

  public async updateTransaction(id: string, data:UpdateTransactionData, socket: Socket): Promise<void> {
    const {
    status,
    payerEmail
  } = data;

    if (!id) {
      return ErrorHandler
        .handle("ID da transação é obrigatório para atualização",socket);
    }

    if (status !== undefined && !Object.values(TransactionStatus).includes(status as TransactionStatus)) {
      return ErrorHandler.handle("Status da transação inválido",socket);
    }

    const existingTransaction = await this.transactionRepository.findById(id);

    if (!existingTransaction) {
      return ErrorHandler.handle("Transação com este ID não encontrada",socket);
    }

    const dataToUpdate: {
      status?: TransactionStatus;
      payerEmail?: string;
    } = {};

    if (status !== undefined) {
      dataToUpdate.status = status as TransactionStatus;
    }

    if (payerEmail !== undefined) {
      dataToUpdate.payerEmail = payerEmail;

      const idempotencyKey = crypto.randomUUID();

      try {
        await this.customerServiceClient.send("CUSTOMER_UPDATE", 
          idempotencyKey, 
          JsonCodec.stableStringify({id: existingTransaction.customerId, balance: existingTransaction.amount.toString()}));

      } catch (error) {
        
        this.deleteTransaction(existingTransaction.id, socket);
        return ErrorHandler.handle("Erro ao atualizar saldo do cliente", socket);

      }
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
      createdAt: transaction.createdAt.toISOString(),
      ...(transaction.payerEmail && {
        payerEmail: transaction.payerEmail
      })
    };

    const response = ResponseParser.serializeResponse(200, responseBody);
    socket.write(response);
    socket.end();

  }
}