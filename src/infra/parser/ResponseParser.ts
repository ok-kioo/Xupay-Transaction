import { Response } from "@/@types/contracts/Response";
import { Request } from "@/@types/contracts/Request";
import { Payload } from "@/@types/contracts/MessageBody";
import { CreateTransactionPayload } from "@/@types/contracts/CreateTransactionPayload";
import { GetTransactionPayload } from "@/@types/contracts/GetTransactionPayload";
import { DeleteTransactionPayload } from "@/@types/contracts/DeleteTransactionPayload";
import { UpdateTransactionPayload } from "@/@types/contracts/UpdateTransactionPayload";
import { Prisma } from "@/infra/database/generated/client";

export class ResponseParser {
  public static deserialize(rawRequest: string): Request {
    try {
      const request = rawRequest.trim();

      const parts = request.split("|");

      if (parts.length !== 3) {
        throw new Error(
          "Requisição com campos diferentes do esperado " + request
        );
      }

      const [method, path, rawBody] = parts;

      const bodyParts = rawBody.split(";").map((part) => part.trim());

      if (bodyParts.length !== 4) {
        throw new Error(
          "Corpo da requisição com campos diferentes do esperado " + rawBody
        );
      }

      const [source, type, rawPayload, timestamp] = bodyParts;

      const payload = this.parsePayload(rawPayload);

      return {
        method,
        path,
        body: {
          source,
          type,
          payload,
          timestamp: timestamp.trim(),
        },
      };
    } catch (error: any) {
      throw new Error(`Formato inválido de corpo: ${error.message}`);
    }
  }

  private static parsePayload(rawPayload: string): Payload {
    const payload = this.parseKeyValueList(rawPayload);

    const hasId = payload.id !== undefined;
    const hasAmount = payload.amount !== undefined;
    const hasCustomerId = payload.customerId !== undefined;
    const hasDelete = payload.delete === "true";
    const hasStatus = payload.status !== undefined;
    if (hasId && hasStatus && !hasAmount && !hasCustomerId && !hasDelete) {
      return this.parseUpdatePayload(payload);
    }
    if (!hasId && hasCustomerId && hasAmount && !hasDelete) {
      return this.parseCreatePayload(payload);
    }

    if (!hasId && hasCustomerId && !hasAmount && !hasDelete) {
      return this.parseGetPayload(payload);
    }

    if (hasId && !hasCustomerId && !hasAmount && hasDelete) {
      return this.parseDeletePayload(payload);
    }

    throw new Error(
      "Payload do Transaction inválido. Formatos aceitos: customerId=xxx | customerId=xxx,amount=0.00 | id=xxx,delete=true"
    );
  }

  private static parseGetPayload(
    payload: Record<string, string>
  ): GetTransactionPayload {
    return {
      kind: "GET_TRANSACTION_PAYLOAD",
      customerId: payload.customerId,
    };
  }

  private static parseUpdatePayload(
    payload: Record<string, string>
  ): UpdateTransactionPayload {
    return {
      kind: "UPDATE_TRANSACTION_PAYLOAD",
      id: payload.id,
      status: payload.status,
    };
  }

  private static parseCreatePayload(
    payload: Record<string, string>
  ): CreateTransactionPayload {
    return {
      kind: "CREATE_TRANSACTION_PAYLOAD",
      customerId: payload.customerId,
      amount: new Prisma.Decimal(payload.amount),
    };
  }

  private static parseDeletePayload(
    payload: Record<string, string>
  ): DeleteTransactionPayload {
    return {
      kind: "DELETE_TRANSACTION_PAYLOAD",
      id: payload.id,
    };
  }

  private static parseKeyValueList(rawPayload: string): Record<string, string> {
    if (!rawPayload || rawPayload.trim() === "") {
      throw new Error("Payload vazio");
    }

    const payload: Record<string, string> = {};

    const fields = rawPayload.split(",");

    for (const field of fields) {
      const separatorIndex = field.indexOf("=");

      if (separatorIndex === -1) {
        throw new Error(`Campo de payload sem "=": ${field}`);
      }

      const key = field.slice(0, separatorIndex).trim();
      const value = field.slice(separatorIndex + 1).trim();

      if (!key || !value) {
        throw new Error(`Campo de payload inválido: ${field}`);
      }

      payload[key] = value;
    }

    return payload;
  }

  public static serialize(response: Response): string {
    return `${response.method}|${response.path}|${response.body.source};${response.body.type};${response.body.payload};${response.body.timestamp}`;
  }
}