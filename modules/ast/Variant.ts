import { NamedNode } from './Node';
import { MayHaveTags } from './Tag';
import { State, VariantLike } from './VariantLike';

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