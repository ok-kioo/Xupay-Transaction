import { PayloadBase } from "../PayloadBase";

export type GetTransactionHistoryPayload = PayloadBase & {
    kind: "GET_TRANSACTION_HISTORY_PAYLOAD";
    customerId: string;
}