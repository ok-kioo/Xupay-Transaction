import { PayloadBase } from "./PayloadBase";

export type GetTransactionPayload = PayloadBase & {
    kind: "GET_TRANSACTION_PAYLOAD";
    customerId: string;
}