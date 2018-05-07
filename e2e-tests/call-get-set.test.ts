import axios from "axios";
import { generateKey } from "../src/secure-values/crypto";

const baseURI = "https://2zz3sx8353.execute-api.eu-west-2.amazonaws.com/dev/";

const set = async (id: string, encryption_key: string, value: any) =>
  await axios.post(`${baseURI}set`, { id, value, encryption_key });

const get = async (id: string, encryption_key: string) =>
  await axios.post(`${baseURI}get`, { id, encryption_key });

test("set/get happy path", async () => {
  const id = "test-id-1";
  const value = "sample-string";
  const encryption_key = generateKey();

  const setAnswer = await set(id, encryption_key, value);
  expect(setAnswer.status).toBe(200);

  const getAnswer = await get(id, encryption_key);
  expect(getAnswer.status).toBe(200);
  expect(getAnswer.data.length).toBe(1);
  expect(getAnswer.data[0].id).toBe(id);
  expect(getAnswer.data[0].value).toBe(value);
});

test("set/get wildcard search", async () => {
  const id = "test-id-";
  const value = "sample-string";
  const encryption_key = generateKey();
  const encryption_key2 = generateKey();

  let setAnswer;
  let getAnswer;
  setAnswer = await set(id + "10", encryption_key, value + "10");
  expect(setAnswer.status).toBe(200);

  setAnswer = await set(id + "11", encryption_key, value + "11");
  expect(setAnswer.status).toBe(200);

  setAnswer = await set(id + "12", encryption_key, value + "12");
  expect(setAnswer.status).toBe(200);

  setAnswer = await set(id + "20", encryption_key, value + "20");
  expect(setAnswer.status).toBe(200);

  setAnswer = await set(id + "21", encryption_key2, value + "21");
  expect(setAnswer.status).toBe(200);

  getAnswer = await get(id, encryption_key);
  expect(getAnswer.status).toBe(200);
  expect(getAnswer.data.length).toBe(0);

  getAnswer = await get(id + "10", encryption_key);
  expect(getAnswer.status).toBe(200);
  expect(getAnswer.data.length).toBe(1);
  expect(getAnswer.data[0].id).toBe(id + "10");
  expect(getAnswer.data[0].value).toBe(value + "10");

  const expectedAnswer = [
    { id: id + "10", value: value + "10" },
    { id: id + "11", value: value + "11" },
    { id: id + "12", value: value + "12" }
  ];
  getAnswer = await get(id + "1*", encryption_key);
  expect(getAnswer.status).toBe(200);
  expect(getAnswer.data).toEqual(expect.arrayContaining(expectedAnswer));
  expect(expectedAnswer).toEqual(expect.arrayContaining(getAnswer.data));


  // look for 2* but 21 should not be included as it use different key
  const expectedAnswer2 = [
    { id: id + "20", value: value + "20" },
  ];
  getAnswer = await get(id + "2*", encryption_key);
  expect(getAnswer.status).toBe(200);
  expect(getAnswer.data).toEqual(expect.arrayContaining(expectedAnswer2));
  expect(expectedAnswer2).toEqual(expect.arrayContaining(getAnswer.data));

  // look for 2* but 20 should not be included as it use different key
  const expectedAnswer3 = [
    { id: id + "21", value: value + "21" },
  ];
  getAnswer = await get(id + "2*", encryption_key2);
  expect(getAnswer.status).toBe(200);
  expect(getAnswer.data).toEqual(expect.arrayContaining(expectedAnswer3));
  expect(expectedAnswer3).toEqual(expect.arrayContaining(getAnswer.data));
});
