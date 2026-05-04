import { PayloadBase } from "./PayloadBase";
import { Prisma } from "@/infra/database/generated/client";

export type CreateTransactionPayload = PayloadBase & {
  kind: "CREATE_TRANSACTION_PAYLOAD";
  amount: Prisma.Decimal;
  customerId: string;
};