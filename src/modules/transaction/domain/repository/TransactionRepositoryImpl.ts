import { TransactionStatus } from "@/infra/database/generated/browser";
import { Transaction } from "../entity/Transaction";
import { ITransactionRepository } from "./ITransactionRepository";
import { prismaClient } from "@/infra/database/prismaClient";

export class TransactionRepositoryImpl implements ITransactionRepository {
 
    public async create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'payerEmail' | 'status' >): Promise<Transaction> {
        return await prismaClient.transaction.create({
            data: {
                customerId: transaction.customerId,
                amount: transaction.amount,
                pixCode: transaction.pixCode
            }
        });
    }

    public async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
        return await prismaClient.transaction.update({
            where: {
                id: id
            },
            data: data
        });
    }

    public async delete(id: string): Promise<void> {
        await prismaClient.transaction.delete({
            where: {
                id: id
            }
        });
    }

    public async findById(id: string): Promise<Transaction | null> {
        const transaction = await prismaClient.transaction.findUnique({
            where: {
                id: id
            }
        });

        return transaction;
    }

}