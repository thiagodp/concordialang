import { render } from "mustache";
import { AbstractTestScript, ATSCommand } from '../../modules/testscript/AbstractTestScript';
import { CommandMapper } from "./CommandMapper";
const dedent = require('dedent-js');
import * as logSymbols from 'log-symbols';
import chalk from 'chalk';

/**
 * Generate test scripts for CodeceptJS.
 *
 * Uses [Mustache](https://github.com/janl/mustache.js/) for this purpose.
 */
export class TestScriptGenerator {

    private template: string;

    constructor(
        private mapper: CommandMapper
    ) {
        this.template =
        dedent
        `// Generated with ❤ by Concordia
        // source: {{{sourceFile}}}
        //
        // THIS IS A GENERATED FILE - MODIFICATIONS CAN BE LOST !

        Feature("{{feature.name}}");
        {{#beforeFeature}}

        BeforeSuite( async (I) => { // Before Feature
            {{#convertedCommands}}
            {{{.}}}
            {{/convertedCommands}}
        });
        {{/beforeFeature}}
        {{#afterFeature}}

        AfterSuite( async (I) => { // After Feature
            {{#convertedCommands}}
            {{{.}}}
            {{/convertedCommands}}
        });
        {{/afterFeature}}
        {{#beforeEachScenario}}

        Before( async (I) => { // Before Each Scenario
            {{#convertedCommands}}
            {{{.}}}
            {{/convertedCommands}}
        });
        {{/beforeEachScenario}}
        {{#afterEachScenario}}

        After( async (I) => { // After Each Scenario
            {{#convertedCommands}}
            {{{.}}}
            {{/convertedCommands}}
        });
        {{/afterEachScenario}}

        {{#testcases}}
        Scenario("{{scenario}} | {{name}}", (I) => {
            {{#convertedCommands}}
            {{{.}}}
            {{/convertedCommands}}
        });

        {{/testcases}}`;
    }

    public generate( ats: AbstractTestScript ): string {

        // console.log( 'FROM', ats.sourceFile );

        let obj: any = { ... ats }; // spread to do a deep clone

        for ( let test of obj.testcases || [] ) {
            test.convertedCommands = [];
            for ( let cmd of test.commands || [] ) {
                let converted: string[] = this.mapper.map( cmd );
                if ( 0 === converted.length ) {
                    console.log( logSymbols.warning,
                        'Plug-in could not convert command from',
                        chalk.yellowBright( ats.sourceFile ),
                        '(' + cmd.location.line + ',' + cmd.location.column + ')'
                    );
                    converted = [ this.mapper.makeCommentWithCommand( cmd ) ];
                }
                test.convertedCommands.push.apply( test.convertedCommands, converted );
            }
        }

        const events = [ 'beforeFeature', 'afterFeature', 'beforeEachScenario', 'afterEachScenario' ];
        for ( let eventStr of events ) {
            let event = obj[ eventStr ];
            if ( ! event ) {
                continue;
            }
            event.convertedCommands = [];
            for ( let cmd of event.commands || [] ) {
                event.convertedCommands.push( this.mapper.map( cmd ) );
            }
        }

        return render( this.template, obj ); // mustache's renderer
    }

}