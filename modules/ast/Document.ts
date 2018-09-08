import { TestCase } from './TestCase';
import { Database } from './Database';
import { Table } from './Table';
import { ConstantBlock } from './ConstantBlock';
import { FileInfo } from './FileInfo';
import { Feature } from './Feature';
import { UIElement } from "./UIElement";
import { Import } from "./Import";
import { Language } from "./Language";
import { RegexBlock } from "./RegexBlock";
import { BeforeAll, AfterAll, BeforeFeature, AfterFeature, BeforeEachScenario, AfterEachScenario } from './TestEvent';

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