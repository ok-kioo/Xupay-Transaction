import { DeleteTransactionPayload } from "./payload/DeleteTransactionPayload";
import { CreateTransactionPayload } from "./payload/CreateTransactionPayload";
import { GetTransactionPayload } from "./payload/GetTransactionPayload";
import { UpdateTransactionPayload } from "./payload/UpdateTransactionPayload";
import { HealthPayload } from "./payload/HealthPayload";

export type Payload =
| DeleteTransactionPayload
| CreateTransactionPayload
| GetTransactionPayload
| UpdateTransactionPayload
| HealthPayload;

export type MessageBody = {
    payload: Payload;
};