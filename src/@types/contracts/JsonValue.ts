import { Prisma } from "@/infra/database/generated/client"; 

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | Prisma.Decimal
  | { [key: string]: JsonValue };
