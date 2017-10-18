import { NodeWithNameAndValue, HasItems } from "./Node";

/**
 * Block node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface Block< T extends BlockItem > extends HasItems< T > {
    items: T[];
}

/**
 * Block item node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface BlockItem extends NodeWithNameAndValue {
}