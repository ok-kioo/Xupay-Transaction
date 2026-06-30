import { DeleteTransactionPayload } from "./payload/DeleteTransactionPayload";
import { CreateTransactionPayload } from "./payload/CreateTransactionPayload";
import { GetTransactionPayload } from "./payload/GetTransactionPayload";
import { UpdateTransactionPayload } from "./payload/UpdateTransactionPayload";
import { HealthPayload } from "./payload/HealthPayload";
import { GetHistoryTransactionPayload } from "./payload/GetHistoryTransactionPayload copy";

export type Payload =
| DeleteTransactionPayload
| CreateTransactionPayload
| GetTransactionPayload
| UpdateTransactionPayload
| HealthPayload
| GetHistoryTransactionPayload;

export type MessageBody = {
    payload: Payload;
};