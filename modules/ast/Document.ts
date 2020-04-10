import { ConstantBlock } from './ConstantBlock';
import { Database } from './Database';
import { Feature } from './Feature';
import { FileInfo } from './FileInfo';
import { Import } from "./Import";
import { Language } from "./Language";
import { RegexBlock } from "./RegexBlock";
import { Table } from './Table';
import { TestCase } from './TestCase';
import { AfterAll, AfterEachScenario, AfterFeature, BeforeAll, BeforeEachScenario, BeforeFeature } from './TestEvent';
import { UIElement } from "./UIElement";

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

    regexBlock?: RegexBlock; // global
    constantBlock?: ConstantBlock; // global
    uiElements?: UIElement[]; // global, but a feature may have them too
    tables?: Table[]; // global
    databases?: Database[]; // global

    beforeAll?: BeforeAll; // global
    afterAll?: AfterAll; // global
    beforeFeature?: BeforeFeature; // local, Feature must be declared before it
    afterFeature?: AfterFeature; // local, Feature must be declared before it
    beforeEachScenario?: BeforeEachScenario; // local, Feature must be declared before it
    afterEachScenario?: AfterEachScenario; // local, Feature must be declared before it

}