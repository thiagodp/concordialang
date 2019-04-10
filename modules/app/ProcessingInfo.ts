import { LocatedException } from "concordialang-types";

export class ProcessingInfo {
    constructor(
        public durationMs: number,
        public errors: LocatedException[],
        public warnings: LocatedException[]
    ) {
    }
}