import { render } from "mustache";
const dedent = require('dedent-js');
import * as logSymbols from 'log-symbols';
import chalk from 'chalk';
import { AbstractTestScript, ATSCommand } from 'concordialang-types';
import { CommandMapper } from "./CommandMapper";

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
                let converted: string[] = this.analyzeConverted( this.mapper.map( cmd ), cmd, ats );
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
                let converted: string[] = this.analyzeConverted( this.mapper.map( cmd ), cmd, ats );
                event.convertedCommands.push.apply( event.convertedCommands, converted );
            }
        }

        return render( this.template, obj ); // mustache's renderer
    }

    analyzeConverted( converted: string[], cmd: ATSCommand, ats: AbstractTestScript ): string[] {
        if ( 0 === converted.length ) {
            console.log( logSymbols.warning,
                'Plug-in could not convert command from',
                chalk.yellowBright( ats.sourceFile ),
                '(' + cmd.location.line + ',' + cmd.location.column + ')'
            );
            return [ this.mapper.makeCommentWithCommand( cmd ) ];
        }
        return converted;
    };


}