import { FileInfo } from './FileInfo';
import { Feature } from './Feature';
import { Task } from './Task';
import { UI } from "./UI";
import { Tag } from "./Tag";
import { Import } from "./Import";
import { Language } from "./Language";
import { Regex } from "./Regex";

/**
 * Document
 * 
 * @author Thiago Delgado Pinto
 */
export interface Document {

    fileInfo?: FileInfo;
    
    language?: Language;
    imports?: Array< Import >;
    tags?: Array< Tag >;    

    feature?: Feature;

    uis?: Array< UI >;

    tasks?: Array< Task >;

    regexes?: Array< Regex >;

}