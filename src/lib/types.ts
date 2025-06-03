export type DeepDelta<T> = {
    [P in keyof T]?: T[P] extends object ? DeepDelta<T[P]> : T[P];
};