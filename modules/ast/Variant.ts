import { NamedNode } from './Node';
import { MayHaveTags } from './Tag';
import { Step } from './Step';
import { VariantLike, State } from './VariantLike';
import { TestCase } from './TestCase';

/**
 * Variant
 *
 * @see VariantLike
 *
 * @author Thiago Delgado Pinto
 */
export interface Variant extends VariantLike, NamedNode, MayHaveTags {

    /** Postconditions, usually detected during test scenario generation */
    postconditions?: State[];
}