import { NamedNode } from './Node';
import { MayHaveTags } from './Tag';
import { Text } from '../ast/Text';
import { Scenario } from './Scenario';
import { Variant } from './Variant';
import { UIElement } from './UIElement';

/**
 * Feature node.
 * 
 * @author Thiago Delgado Pinto
 * @see /doc/langspec/asl-en.md
 */
export interface Feature extends NamedNode, MayHaveTags {

    description?: string;
    sentences?: Text[];    
    scenarios?: Scenario[];
    uiElements?: UIElement[];
    variants?: Variant[];
    
}