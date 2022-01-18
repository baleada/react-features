import { MutableRefObject } from "react";

export function isRef<Value extends any> (value: MutableRefObject<Value> | any): value is MutableRefObject<Value> {
  return typeof value === 'object' && value !== null && 'current' in value
}
