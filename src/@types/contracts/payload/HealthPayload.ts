import { PayloadBase } from "../PayloadBase";

export type HealthPayload = PayloadBase & {
    kind: "HEALTH_PAYLOAD";
}