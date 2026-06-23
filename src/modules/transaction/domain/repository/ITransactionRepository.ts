import { Transaction } from "../entity/Transaction";

export interface ITransactionRepository {
    create(transaction: Omit<Transaction, 'id' | 'createdAt' >): Promise<Transaction>;
    update(id: string, status: Omit<Transaction, 'id' | 'createdAt' | 'customerId' | 'amount'>): Promise<Transaction>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<Transaction | null>;

    
}
