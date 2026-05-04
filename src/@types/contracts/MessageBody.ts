import { DeleteTransactionPayload } from "./DeleteTransactionPayload";
import { CreateTransactionPayload } from "./CreateTransactionPayload";
import { GetTransactionPayload } from "./GetTransactionPayload";
import { UpdateTransactionPayload } from "./UpdateTransactionPayload";

export type Payload =
| DeleteTransactionPayload
| CreateTransactionPayload
| GetTransactionPayload
| UpdateTransactionPayload;

export type MessageBody = {
    source: string;
    type: string;
    payload: Payload;
    timestamp: string;
};