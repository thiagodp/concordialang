import { Location } from './Location';

/**
 * Node
 * 
 * @author Thiago Delgado Pinto
 */
export interface Node {

    tokenType(): string;

    location(): Location;

}