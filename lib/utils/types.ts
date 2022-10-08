export type Override<Type, Original> = Omit<Type, keyof Original> & Original;
