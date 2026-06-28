import { Transaction } from "../entity/Transaction";

export interface ITransactionRepository {
    create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'payerEmail' | 'status' >): Promise<Transaction>;
    update(id: string, data: Partial<Transaction>): Promise<Transaction>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<Transaction | null>;

    
}
