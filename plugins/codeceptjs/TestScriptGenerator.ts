import { ActionMapper } from "./ActionMapper";
import { render } from "mustache";
import { AbstractTestScript, ATSCommand } from '../../modules/testscript/AbstractTestScript';

const dedent = require('dedent-js');

/**
 * Generate test scripts for CodeceptJS.
 * Uses [Mustache](https://github.com/janl/mustache.js/) for this purpose.
 * 
 * @author Matheus Eller Fagundes
 * @author Thiago Delgado Pinto
 */
export class TestScriptGenerator {

    private template: string;
    private mapper: ActionMapper;

    constructor() {
        this.template =
        dedent
        `/** Generated with <3 by Concordia. Run the following tests using CodeceptJS. */

        Feature('{{feature.name}}');
        
        {{#testcases}}
        Scenario('{{scenario}} | {{name}}', (I) => {
            {{#convertedCommands}}
            {{{.}}}
            {{/convertedCommands}}
        });
        
        {{/testcases}}`;
        this.mapper = new ActionMapper();
    }
    
    public generate = ( ats: AbstractTestScript ): string => {

        let obj: any = { ... ats }; // spread to do a deep clone
        for ( let test of obj.testcases ) {
            test.convertedCommands = [];
            for ( let cmd of test.commands ) {
                test.convertedCommands.push( this.mapper.map( cmd ) );
            }
        }

        return render( this.template, obj ); // mustache's renderer
    }

}