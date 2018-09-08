import { ListItem } from './ListItem';
import { HasItems, HasName, HasValue } from './Node';

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
export interface BlockItem extends ListItem, HasName, HasValue {
}