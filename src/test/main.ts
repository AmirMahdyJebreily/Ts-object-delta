import { DeepDelta } from "../lib/types"
import { mergeDelta } from "../lib/merge"

type W = {
    r: string
}
type Q = {
    a: number,
    b: number,
    c: {
        d: number,
        e: {
            f: Array<W>
            k: boolean
        }
    }
}




const A: Q = {
    a: 1,
    b: 2,
    c: {
        d: 3,
        e: {
            f: [
                {
                    r: 'hello'
                },
                {
                    r: 'hello'
                }, {
                    r: 'hello'
                }
            ],
            k: true
        }
    }
}

const D_A: DeepDelta<typeof A> = {
    b: 1000,
    c: {
        e: {
            f: [
                {
                    r: 'bye'
                },
                undefined,
                {
                    r: 'bye'
                },
                {
                    r: 'hi'
                }
            ]
        }
    }
}


mergeDelta(A, D_A)
console.log("The source object is:", A)