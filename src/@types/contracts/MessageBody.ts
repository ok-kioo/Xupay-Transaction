import { DeleteTransactionPayload } from "./payload/DeleteTransactionPayload";
import { CreateTransactionPayload } from "./payload/CreateTransactionPayload";
import { GetTransactionPayload } from "./payload/GetTransactionPayload";
import { UpdateTransactionPayload } from "./payload/UpdateTransactionPayload";

export type Payload =
| DeleteTransactionPayload
| CreateTransactionPayload
| GetTransactionPayload
| UpdateTransactionPayload;

export type MessageBody = {
    payload: Payload;
};