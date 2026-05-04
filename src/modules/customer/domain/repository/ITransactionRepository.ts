import { Transaction } from "../entity/Transaction";

export interface ITransactionRepository {
    create(transaction: Omit<Transaction, 'id' | 'createdAt' >): Promise<void>;
    update(id: string, status: Omit<Transaction, 'id' | 'createdAt' | 'customerId' | 'amount'>): Promise<void>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<Transaction | null>;

    
}
