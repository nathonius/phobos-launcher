export type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONObject
  | JSONArray;
export type JSONObject = { [k: string]: JSONValue };
export type JSONArray = JSONValue[];
