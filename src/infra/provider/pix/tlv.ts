export function tlv(id: string, value: string): string {
    const length = value.length.toString().padStart(2, "0");
    return `${id}${length}${value}`;
}