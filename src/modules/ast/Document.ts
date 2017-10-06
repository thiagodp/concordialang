import { Table } from './Table';
import { ConstantBlock } from './ConstantBlock';
import { FileInfo } from './FileInfo';
import { Feature } from './Feature';
import { Task } from './Task';
import { UIElement } from "./UIElement";
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
    fileWarnings?: Error[];
    
    language?: Language;
    imports?: Import[];

    feature?: Feature; // public

    states?: State[]; // public
    regexBlock?: RegexBlock; // public
    constantBlock?: ConstantBlock; // public
    uiElements?: UIElement[]; // public, but a feature may have them too
    tables?: Table[]; // public

}