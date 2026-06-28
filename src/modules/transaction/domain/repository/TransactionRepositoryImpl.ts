import { TransactionStatus } from "@/infra/database/generated/browser";
import { Transaction } from "../entity/Transaction";
import { ITransactionRepository } from "./ITransactionRepository";
import { PrismaClient } from "@prisma/client/extension";

export class TransactionRepositoryImpl implements ITransactionRepository {
 
    public async create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'payerEmail' | 'status' >): Promise<Transaction> {
        const prisma = new PrismaClient();
        return await prisma.transaction.create({
            data: {
                customerId: transaction.customerId,
                amount: transaction.amount,
                pixCode: transaction.pixCode
            }
        });
    }

    public async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
        const prisma = new PrismaClient();
        return await prisma.transaction.update({
            where: {
                id: id
            },
            data: data
        });
    }

    public async delete(id: string): Promise<void> {
        const prisma = new PrismaClient();
        await prisma.transaction.delete({
            where: {
                id: id
            }
        });
    }

    public async findById(id: string): Promise<Transaction | null> {
        const prisma = new PrismaClient();

        const transaction = await prisma.transaction.findUnique({
            where: {
                id: id
            }
        });

        return transaction;
    }

}