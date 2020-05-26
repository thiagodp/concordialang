import { Entities } from "../Entities";

/**
 * Minimal and maximal values of each target.
 *
 * They will be only considered if they appear in "targets".
 * If they do appear in "targets", they will be *disconsidered* if:
 *  - min > minTargets
 *  - max > maxTargets
 *
 */
export interface Occurrence {
    min: number,
    max: number
}

export type EntityOccurrence = {
    [ key in keyof typeof Entities ]?: Occurrence
};

export type SyntaxRule = EntityOccurrence & {

    /** Rule name */
    name?: string;

    /** Minimal number of targets accepted. It has precedence over all 'min' values. */
    minTargets?: number;
    /** Maximal number of targets accepted. It has precedence over all 'max' values. */
    maxTargets?: number;

    /**
     * Accepted targets (NLP entities).
     *  When "maxTargets" is 1 and "targets" has more than one ui element,
     *      it accepts one OR another.
     *  When "maxTargets" > 1, the minimal of each target should be configured.
     */
    targets?: Array< Entities >;

    /**
     * Other entity/action or entities/actions that must be used together.
     */
    mustBeUsedWith?: Array< string >;
}
