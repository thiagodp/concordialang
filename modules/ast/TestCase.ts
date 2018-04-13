import { NamedNode } from "./Node";
import { MayHaveTags } from "./Tag";
import { Step } from "./Step";

/**
 * Test Case
 *
 * @author Thiago Delgado Pinto
 */
export interface TestCase extends NamedNode, MayHaveTags {

    /** Indicates that it is a generated test case (not declared manually). */
    generated?: boolean;

    /**
     * Indicates that it was *not* read from a file.
     *
     * When a Test Case is marked as generated and it was read from a file,
     * it can be discarded before saving a test case file, since an updated
     * test case is probably going to replace it.
     */
    notRead?: boolean;

    /** Declared scenario index, with @scenario( <index> ). Real index is always declared - 1. */
    declaredScenarioIndex?: number;

    /** Declared variant index, with @variant( <index> ). Real index is always declared - 1. */
    declaredVariantIndex?: number;

    /** Steps */
    sentences: Step[];

    /**
     * First step after preconditions. Useful for state calls, because they
     * need to start after preconditions.
     */
    stepAfterPreconditions: Step;

}
