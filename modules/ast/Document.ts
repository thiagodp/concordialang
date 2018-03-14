import { TestCase } from './Variant';
import { Database } from './Database';
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

    language?: Language; // local
    imports?: Import[]; // local

    feature?: Feature; // global
    testCases?: TestCase[]; // local, belongs to a feature declared or imported

    states?: State[]; // global
    regexBlock?: RegexBlock; // global
    constantBlock?: ConstantBlock; // global
    uiElements?: UIElement[]; // global, but a feature may have them too
    tables?: Table[]; // global
    databases?: Database[]; // global

}