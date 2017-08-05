import { Node } from './Node';
import { Location } from './Location';

/**
 * Abstract node
 * 
 * @author Thiago Delgado Pinto
 */
export abstract class AbstractNode implements Node {

    protected _location: Location;
    
    /** @inheritDoc */
    public abstract tokenType(): string;

    /** @inheritDoc */
    public location(): Location {
        return this._location;
    }

}