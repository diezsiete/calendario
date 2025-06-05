export function match<T extends string | number, R>(value: T, cases: Record<T, R>, defaultValue?: R): R {
    return Object.prototype.hasOwnProperty.call(cases, value) ? cases[value] : (defaultValue as R);
}