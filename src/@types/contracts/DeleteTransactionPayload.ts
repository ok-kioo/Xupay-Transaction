import { PayloadBase } from "./PayloadBase";

export type DeleteTransactionPayload = PayloadBase & {
    kind: "DELETE_TRANSACTION_PAYLOAD";
    id: string;
}