import { TestScriptPluginFinder } from "./TestScriptPluginFinder";
import { TestScriptPlugin } from './TestScriptPlugin';

import { CodeceptJS } from '../../data/plugins/CodeceptJS';

/**
 * Returns the default test script plugins.
 * 
 * @author Thiago Delgado Pinto
 */
export class InMemoryTestScriptPluginFinder implements TestScriptPluginFinder {

    private _available: TestScriptPlugin[] = [
        new CodeceptJS()
    ];

    public find(): TestScriptPlugin[] {
        return this._available;
    }
}