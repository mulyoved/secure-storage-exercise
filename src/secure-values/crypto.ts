const CryptoGcm = require("crypto-gcm");
const crypto = require("crypto");

export const generateKey = (): string => {
  const key = crypto.randomBytes(32);
  return key.toString("hex");
};

export const convertKey = (encryption_key: string): Buffer =>
  Buffer.from(encryption_key, "hex");

export const encrypt = (value: any, encryption_key: string): string => {
  const cg = new CryptoGcm({
    key: convertKey(encryption_key),
    encoding: {
      plaintext: "utf8", // also supported: ascii, buffer
      payload: "base64" // also supported: base64, hex
    }
  });

  const result = cg.encrypt(JSON.stringify({ value }));
  cg.destroy();

  return result;
};

export const decrypt = (
  encryptedValue: any,
  encryption_key: string
): string => {
  const cg = new CryptoGcm({
    key: convertKey(encryption_key),
    encoding: {
      plaintext: "utf8", // also supported: ascii, buffer
      payload: "base64" // also supported: base64, hex
    }
  });

  const result = cg.decrypt(encryptedValue);
  cg.destroy();

  let value: any;
  if (!result) {
    throw new Error(
      "decrypt: error decrypt value, probably wrong encryption_key"
    );
  } else {
    try {
      value = JSON.parse(result).value;
    } catch (err) {
      throw new Error(`decrypt: error parsing decrypted value [${result}]`);
    }
  }

  return value;
};
