import { DeepDelta, DELETE } from "../types/types"

export function mergeDelta<T extends object>(src: T, delta: DeepDelta<T>): void {
    for (const key in delta) {
        const k = key as keyof T;
        const deltaValue = delta[k];
        const srcValue = src[k];

        if (deltaValue === DELETE) {
            delete src[k];
            continue;
        }

        if (deltaValue === undefined) continue;


        if (Array.isArray(deltaValue)) {
            if (!Array.isArray(srcValue)) {
                src[k] = deltaValue as T[typeof k];
                continue;
            }

            const srcArr = srcValue as unknown as any[];
            const deltaArr = deltaValue as unknown as any[];

            for (let i = 0; i < deltaArr.length; i++) {
                if (deltaArr[i] === undefined) continue;

                if (typeof deltaArr[i] === "object" && deltaArr[i] !== null) {
                    if (srcArr[i] === undefined || typeof srcArr[i] !== "object") {
                        srcArr[i] = deltaArr[i];
                    } else {
                        mergeDelta(srcArr[i], deltaArr[i]);
                    }
                } else {
                    srcArr[i] = deltaArr[i];
                }
            }

        } else if (
            typeof deltaValue === "object" &&
            deltaValue !== null &&
            typeof srcValue === "object" &&
            srcValue !== null &&
            !Array.isArray(srcValue)
        ) {
            mergeDelta(srcValue, deltaValue as DeepDelta<T[typeof k]>);
        } else {
            src[k] = deltaValue as T[typeof k];
        }
    }
}