import { LocatedException } from "../dbi/LocatedException";

export class ProcessingInfo {
    constructor(
        public durationMs: number,
        public errors: LocatedException[],
        public warnings: LocatedException[]
    ) {
    }
}