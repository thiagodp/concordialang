import { FileInfo } from './FileInfo';
import { Feature } from './Feature';
import { Task } from './Task';
import { UI } from "./UI";
import { Tag } from "./Tag";
import { Import } from "./Import";
import { Language } from "./Language";
import { Regex } from "./Regex";
import { State } from "./State";

/**
 * Document
 * 
 * @author Thiago Delgado Pinto
 */
export interface Document {

    fileInfo?: FileInfo;
    fileErrors?: Error[];
    
    language?: Language;
    imports?: Import[];
    tags?: Tag[];

    feature?: Feature;

    states?: State[];

    uis?: UI[];

    tasks?: Task[];

    regexes?: Regex[];

}