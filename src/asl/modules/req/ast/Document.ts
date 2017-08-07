import { Feature } from './Feature';
import { Task } from './Task';
import { UI } from "./UI";
import { Tag } from "./Tag";
import { Import } from "./Import";

/**
 * Document
 * 
 * @author Thiago Delgado Pinto
 */
export interface Document {

    file?: string;
    
    language?: string;
    tags?: Array< Tag >;
    imports?: Array< Import >;

    features?: Array< Feature >;

    uis?: Array< UI >;

    tasks?: Array< Task >;

}