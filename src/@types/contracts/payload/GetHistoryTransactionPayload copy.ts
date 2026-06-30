import { PayloadBase } from "../PayloadBase";

export type GetHistoryTransactionPayload = PayloadBase & {
    kind: "GET_HISTORY_TRANSACTION_PAYLOAD";
    customerId: string;
}