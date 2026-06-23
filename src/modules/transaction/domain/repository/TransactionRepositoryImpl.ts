import { Transaction } from "../entity/Transaction";
import { ITransactionRepository } from "./ITransactionRepository";
import { PrismaClient } from "@prisma/client/extension";

export class TransactionRepositoryImpl implements ITransactionRepository {
 
    public async create(transaction: Omit<Transaction, "id" | "createdAt">): Promise<void> {
        const prisma = new PrismaClient();
        await prisma.transaction.create({
            data: {
                customerId: transaction.customerId,
                amount: transaction.amount
            }
        });
    }

    public async update(id: string, status: Omit<Transaction, 'id' | 'createdAt' | 'customerId' | 'amount'>): Promise<void> {
        const prisma = new PrismaClient();
        await prisma.transaction.update({
            where: {
                id: id
            },
            data: {
                status: status
            }
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

    public async findById(id: string): Promise<Transaction> {
        const prisma = new PrismaClient();

        const transaction = await prisma.transaction.findUnique({
            where: {
                id: id
            }
        });

        return transaction;
    }

}