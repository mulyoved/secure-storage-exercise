import {decrypt, encrypt, generateKey} from "../secure-values/crypto";
import * as crypto from "crypto";

test("encrypt/decrypt happy path", () => {
  const value = "sample-string";

  const key = generateKey();
  const encryptedValue = encrypt(value, key);

  const decrypted = decrypt(encryptedValue, key);
  expect(decrypted).toBe(value);
});

test("encrypt/decrypt keep value type", () => {
  const check = (value: any) => {
    const key = generateKey();

    console.log("key", key);

    const encryptedValue = encrypt(value, key);

    const decrypted = decrypt(encryptedValue, key);
    expect(decrypted).toEqual(value);
  };

  check("string");
  check(42);
  check(null);
  check(undefined);
  check(0);
  check(true);
  check(false);
  check([]);
  check(["val", 23, true]);
  check({key: "val", num: 23, bool: true});
  check({});
});

test("decrypt wrong key", () => {
  const value = "sample-string";

  const key = generateKey();
  const wrongKey = generateKey();
  const encryptedValue = encrypt(value, key);
  const decryptError = () => decrypt(encryptedValue, wrongKey);
  expect(decryptError).toThrowError("decrypt: error decrypt value, probably wrong encryption_key");
});

test("encrypt missing key", () => {
  const value = "sample-string";

  const encryptError = () => encrypt(value, null);
  expect(encryptError).toThrowError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
});

test("encrypt bad key", () => {
  const value = "sample-string";
  const key = crypto.randomBytes(31).toString("hex");

  const encryptError = () => encrypt(value, key);
  expect(encryptError).toThrowError(`key should be a buffer of 32 bytes`);
});
