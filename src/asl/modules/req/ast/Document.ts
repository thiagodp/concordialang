import { Feature } from './Feature';
import { Task } from './Task';
import { UI } from "./UI";
import { TagLine } from "./TagLine";
import { Import } from "./Import";
import { Language } from "./Language";
import { Regex } from "./Regex";

/**
 * Document
 * 
 * @author Thiago Delgado Pinto
 */
export interface Document {

    file?: string;
    
    language?: Language;
    imports?: Array< Import >;
    tags?: Array< TagLine >;    

    feature?: Feature;

    uis?: Array< UI >;

    tasks?: Array< Task >;

    regexes?: Array< Regex >;

}