import { ConstantBlock } from './ConstantBlock';
import { FileInfo } from './FileInfo';
import { Feature } from './Feature';
import { Task } from './Task';
import { UI } from "./UIElement";
import { Tag } from "./Tag";
import { Import } from "./Import";
import { Language } from "./Language";
import { RegexBlock } from "./RegexBlock";
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
    tags?: Tag[]; // needed?

    feature?: Feature;
    states?: State[];
    regexBlock?: RegexBlock;
    constantBlock?: ConstantBlock;

    uis?: UI[];

    tasks?: Task[];

}