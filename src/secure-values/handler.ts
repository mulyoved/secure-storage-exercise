import {callServerlessFunction} from "../utils";
import {setValue} from "./set";
import {getValue} from "./get";

export const set = (event: any, context: any, callback: any) => {
  callServerlessFunction(setValue, event, context, callback);
};

export const get = (event: any, context: any, callback: any) => {
  callServerlessFunction(getValue, event, context, callback);
};