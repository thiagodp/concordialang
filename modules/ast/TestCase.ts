import { NamedNode } from "./Node";
import { MayHaveTags } from "./Tag";
import { Step } from "./Step";

/**
 * Test Case
 *
 * @author Thiago Delgado Pinto
 */
export interface TestCase extends NamedNode, MayHaveTags {

    sentences: Step[];

    /** Indicates that it is a generated test case (not declared manually). */
    generated?: boolean;

    /**
     * Indicates that it was *not* read from a file.
     *
     * When a Test Case is marked as generated and it was read from a file,
     * it is discarded before saving the test case file, since an updated
     * test case will replace it.
     */
    notRead?: boolean;

}
