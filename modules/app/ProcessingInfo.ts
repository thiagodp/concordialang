import { LocatedException } from "concordialang-types/req";

export class ProcessingInfo {
    constructor(
        public durationMs: number,
        public errors: LocatedException[],
        public warnings: LocatedException[]
    ) {
    }
}