export type Length<T extends any[]> = T['length']
export type Head<T extends any[]> = T extends [infer U, ...any[]] ? U : never
export type Tail<T extends any[]> = ((...args: T) => any) extends ((
  _: any,
  ...rest: infer U
) => any)
  ? U
  : never
