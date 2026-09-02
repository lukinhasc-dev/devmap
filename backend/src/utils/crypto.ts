import crypto from "crypto";
import fs from "fs";
import path from "path";

const keyPath = path.resolve(__dirname, "../../../secret.key");
const ALGO = "aes-256-gcm";

function loadKey(): Buffer {
    if (fs.existsSync(keyPath)) {
        const raw = fs.readFileSync(keyPath, "utf-8").trim();
        return Buffer.from(raw, "hex");
    }
    const key = crypto.randomBytes(32);
    fs.writeFileSync(keyPath, key.toString("hex"), { mode: 0o600 });
    console.log("🔐 Chave de criptografia gerada com sucesso.");
    return key;
}

const key = loadKey();

export function encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decrypt(payload: string): string {
    const parts = payload.split(":");
    if (parts.length !== 3) {
        throw new Error("Payload cifrado inválido");
    }
    const [ivHex, tagHex, dataHex] = parts;
    const iv = Buffer.from(ivHex as string, "hex");
    const authTag = Buffer.from(tagHex as string, "hex");
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex as string, "hex")), decipher.final()]);
    return decrypted.toString("utf-8");
}
