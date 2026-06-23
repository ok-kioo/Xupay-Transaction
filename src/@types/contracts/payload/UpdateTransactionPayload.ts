import { PayloadBase } from "../PayloadBase";

export type UpdateTransactionPayload = PayloadBase & {
    kind: "UPDATE_TRANSACTION_PAYLOAD";
    id: string;
    status: string;
}