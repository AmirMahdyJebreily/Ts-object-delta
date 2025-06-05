export const DELETE = Symbol('DELETE');
export type DeleteMarker = typeof DELETE;

export type DeepDelta<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepDelta<T[P]> | DeleteMarker
    : T[P] | DeleteMarker;
};