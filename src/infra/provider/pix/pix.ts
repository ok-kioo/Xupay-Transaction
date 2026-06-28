import { tlv } from "./tlv";
import { crc16 } from "./crc16";

interface PixRequest {

    key: string;
    name: string;
    city: string;
    amount?: number;
    txid: string;
}

export function generatePix(req: PixRequest): string {

    const merchantInfo =
        tlv("00", "BR.GOV.BCB.PIX") +
        tlv("01", req.key);

    let payload = "";

    payload += tlv("00", "01");
    payload += tlv("01", "11");

    payload += tlv("26", merchantInfo);

    payload += tlv("52", "0000");
    payload += tlv("53", "986");

    if (req.amount !== undefined) {
        payload += tlv("54", req.amount.toFixed(2));
    }

    payload += tlv("58", "BR");

    payload += tlv("59", req.name.toUpperCase());

    payload += tlv("60", req.city.toUpperCase());

    payload += tlv(
    "62",
    tlv("05", "***")
    );

    payload += "6304";

    const crc = crc16(payload);

    return payload + crc;
}