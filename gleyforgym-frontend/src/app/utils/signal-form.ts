import { WritableSignal } from '@angular/core';

export interface SignalFormField<T> {
  value: () => T;
  set: (val: T) => void;
  update: (val: T) => void;
}

export type SignalForm<T> = {
  [K in keyof T]: () => SignalFormField<T[K]>;
};

export function form<T extends object>(modelSignal: WritableSignal<T>): SignalForm<T> {
  const cache = {} as any;
  return new Proxy(cache, {
    get(target, prop) {
      if (typeof prop === 'string') {
        if (!cache[prop]) {
          cache[prop] = () => ({
            value: () => modelSignal()[prop as keyof T],
            set: (val: any) => {
              modelSignal.update(m => ({
                ...m,
                [prop]: val
              }));
            },
            update: (val: any) => {
              modelSignal.update(m => ({
                ...m,
                [prop]: val
              }));
            }
          });
        }
        return cache[prop];
      }
      return Reflect.get(target, prop);
    }
  }) as SignalForm<T>;
}
