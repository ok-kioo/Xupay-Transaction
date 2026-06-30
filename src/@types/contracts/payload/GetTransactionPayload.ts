import { PayloadBase } from "../PayloadBase";

export type GetTransactionPayload = PayloadBase & {
    kind: "GET_TRANSACTION_PAYLOAD";
    id: string;
    customerId: string;
}