import { NamedNode } from "./Node";
import { MayHaveTags } from "./Tag";
import { Step } from "./Step";

/**
 * Test Case
 *
 * @author Thiago Delgado Pinto
 */
export interface TestCase extends NamedNode, MayHaveTags {

    /**
     * A test should fail when all these conditions apply:
     *   - The Variant has one or more Then sentences that do not produce states
     *   - The DataTestCase explores a constraint (rule) of a UI Element property
     *   - The referred UI Element property has no Otherwise sentences
     *
     * That is, the Variant's postconditions will not be replaced by
     * Otherwise statements and it is expected that the system will behave
     * differently from its postconditions declare, making the test fail.
     * So, since it is expected that the test will fail, it should pass.
     */
    shoudFail?: boolean;

    /**
     * Indicates that it is a generated test case, i.e., not declared manually.
     *
     * Tags @generated may change this flag.
     */
    generated?: boolean;

    /**
     * Indicates that it was *not* read from a file.
     *
     * When a Test Case is marked as generated and it was read from a file,
     * it can be discarded before saving a test case file, since an updated
     * test case is probably going to replace it.
     */
    notRead?: boolean;

    /** Steps */
    sentences: Step[];


    // The following attributes are retrieved from the Tags during Semantic Analysis:

    /** Declared feature name, with @feature( <name> ). Needed only when there are more than one import. */
    declaredFeatureName?: string;

    /** Declared scenario index, with @scenario( <index> ). Real index is always declared - 1. */
    declaredScenarioIndex?: number;

    /** Declared variant index, with @variant( <index> ). Real index is always declared - 1. */
    declaredVariantIndex?: number;

}
