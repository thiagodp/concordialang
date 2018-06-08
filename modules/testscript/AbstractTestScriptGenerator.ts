import { TestCase } from "../ast/TestCase";
import { Document } from '../ast/Document';
import { isDefined } from "../util/TypeChecking";
import { AbstractTestScript, ATSElement, NamedATSElement, ATSTestCase, ATSCommand, ATSDatabaseCommand, ATSConsoleCommand, ATSEvent } from "./AbstractTestScript";
import { Spec } from "../ast/Spec";
import { TagUtil } from "../util/TagUtil";
import { ReservedTags } from "../req/ReservedTags";
import { Location } from "../ast/Location";
import { Entities } from "../nlp/Entities";
import { TestEvent } from "../ast/TestEvent";
import { Actions } from "../util/Actions";
import { Symbols } from "../req/Symbols";
import { DatabaseToAbstractDatabase } from "../db/DatabaseToAbstractDatabase";
import { AbstractDatabase } from "../ast/AbstractDatabase";

/**
 * Generates Abstract Test Script
 */
export class AbstractTestScriptGenerator {

    /**
     * Generate an abstract test script with the test cases of a document.
     *
     * @param doc Document
     * @param spec Specification
     */
    generateFromDocument( doc: Document, spec: Spec ): AbstractTestScript | null {

        // console.log( 'DOC is', doc.fileInfo.path );
        // console.log( 'Test cases', doc.testCases );

        if ( ! doc.testCases || doc.testCases.length < 1 ) {
            return null;
        }

        const hasNoSentences = function hasSentences( target ) {
            return ( ! target || ! target.sentences || target.sentences.length < 1 );
        };

        let beforeAll = doc.beforeAll;
        let afterAll = doc.afterAll;
        let beforeFeature = doc.beforeFeature;
        let afterFeature = doc.afterFeature;
        let beforeEachScenario = doc.beforeEachScenario;
        let afterEachScenario = doc.afterEachScenario;

        // Get from the document
        let feature = ! doc.feature ? null : doc.feature;

        if ( ! feature ) {

            const docsWithFeature = spec.importedDocumentsOf( doc )
                .filter( impDoc => isDefined( impDoc.feature ) );

            // Not found -> get the first feature of a imported document
            if ( docsWithFeature.length > 0 ) {
                const firstDoc = docsWithFeature[ 0 ];

                feature = firstDoc.feature;

                if ( ! beforeAll && isDefined( firstDoc.beforeAll ) ) {
                    beforeAll = firstDoc.beforeAll;
                }

                if ( ! afterAll && isDefined( firstDoc.afterAll ) ) {
                    afterAll = firstDoc.afterAll;
                }

                if ( ! beforeFeature && isDefined( firstDoc.beforeFeature ) ) {
                    beforeFeature = firstDoc.beforeFeature;
                }

                if ( ! afterFeature && isDefined( firstDoc.afterFeature ) ) {
                    afterFeature = firstDoc.afterFeature;
                }

                if ( ! beforeEachScenario && isDefined( firstDoc.beforeEachScenario ) ) {
                    beforeEachScenario = firstDoc.beforeEachScenario;
                }

                if ( ! afterEachScenario && isDefined( firstDoc.afterEachScenario ) ) {
                    afterEachScenario = firstDoc.afterEachScenario;
                }

            }
        }

        // console.log( 'Feature', feature.name );

        // Not found -> assumes a name and location
        const location: Location = ! feature
            ? { column: 1, line: 1, filePath: doc.fileInfo.path } as Location
            : feature.location;
        const featureName: string = ! feature ? 'Unknown feature' : feature.name;

        // ASTRACT TEST SCRIPT

        let ats = new AbstractTestScript();

        // feature, location, sourceFile
        ats.sourceFile = doc.fileInfo.path;
        ats.feature = new NamedATSElement( location, featureName );

        // scenarios
        let scenarioNames: string[] = [];
        if ( isDefined( feature ) ) {
            for ( let s of feature.scenarios || [] ) {
                ats.scenarios.push(
                    new NamedATSElement( s.location, s.name )
                );
                scenarioNames.push( s.name );
            }
        }

        // testCases
        for ( let tc of doc.testCases || [] ) {

            let absTC = new ATSTestCase( tc.location, tc.name );

            absTC.scenario = scenarioNames[ ( tc.declaredScenarioIndex || 1 ) - 1 ] || 'Unknown scenario';
            absTC.invalid = tc.shoudFail;

            for ( let sentence of tc.sentences ) {
                let cmd = this.sentenceToCommand( sentence );
                absTC.commands.push( cmd );
            }

            // console.log( absTC );

            ats.testcases.push( absTC );
        }

        // test events
        let allTestEvents = {
            beforeAll: beforeAll,
            afterAll: afterAll,
            beforeFeature: beforeFeature,
            afterFeature: afterFeature,
            beforeEachScenario: beforeEachScenario,
            afterEachScenario: afterEachScenario
        };

        for ( let e in allTestEvents ) {

            let event = allTestEvents[ e ];
            if ( ! isDefined( event ) || ! isDefined( event.sentences ) ||
                event.sentences.length < 1
            ) {
                continue;
            }

            ats[ e ] = new ATSEvent();
            ats[ e ].commands = this.convertTestEventSentencesToCommands( event, spec );
        }

        // console.log( ats );

        return ats;
    }


    sentenceToCommand( sentence, obj = new ATSCommand(), valuesOverwrite?: any[] ): ATSCommand {
        let cmd = obj;
        cmd.location = sentence.location;
        cmd.action = sentence.action;
        cmd.modifier = sentence.actionModifier;
        cmd.options = sentence.actionOptions;
        cmd.targets = sentence.targets;
        cmd.targetTypes = sentence.targetTypes;
        cmd.values = ( ! valuesOverwrite ) ? sentence.values : valuesOverwrite;
        cmd.invalid = sentence.isInvalidValue;
        cmd.comment = sentence.comment;
        return cmd;
    }


    convertTestEventSentencesToCommands( event: TestEvent, spec: Spec ): ATSCommand[] {

        const dbConversor = new DatabaseToAbstractDatabase();
        const DATABASE_OPTION = 'database';
        const SCRIPT_OPTION = 'script';
        const COMMAND_OPTION = 'command';
        const dbNames = spec.databaseNames();
        const dbVarNames = dbNames.map(
            name => Symbols.CONSTANT_PREFIX + name + Symbols.CONSTANT_SUFFIX );

        const makeDbNameRegex = function makeDbNameRegex( dbName ) {
            const r = '\\' + Symbols.CONSTANT_PREFIX + dbName + '\\' +  Symbols.CONSTANT_SUFFIX + '\\.?';
            return new RegExp( r, 'gi' );
        };

        let commands: ATSCommand[] = [];
        for ( let s of event.sentences || [] ) {

            // Action is "connect" or "disconnect"
            if ( s.action === Actions.CONNECT || s.action === Actions.DISCONNECT ) {
                let dbRef = s.nlpResult.entities.find( e => e.entity === Entities.CONSTANT );
                if ( ! dbRef ) {
                    console.log( 'ERROR: database reference not found in:', s.content );
                    continue;
                }
                const dbName = dbRef.value;

                if ( s.action === Actions.CONNECT ) {
                    const db = spec.databaseWithName( dbName );
                    if ( ! db ) {
                        console.log( 'ERROR: database not found with name:', dbName );
                        continue;
                    }
                    const absDB = dbConversor.convertFromNode( db, spec.basePath );
                    const values = [ dbName, absDB ];

                    const cmd = this.sentenceToCommand( s, new ATSDatabaseCommand(), values );
                    ( cmd as ATSDatabaseCommand ).db = absDB;

                    commands.push( cmd );
                } else {
                    commands.push( this.sentenceToCommand( s, new ATSCommand(), [ dbName ] ) );
                }



                continue;
            }

            // Action is not "run"
            if ( Actions.RUN !== s.action ) {
                commands.push( this.sentenceToCommand( s ) );
                continue;
            }

            // Action is "run" but it doesn't have a value
            if ( ( s.values || [] ).length !== 1 ) {
                continue;
            }

            const options = s.actionOptions || [];

            // options have "command"
            if ( options.indexOf( COMMAND_OPTION ) >= 0 ) {
                let cmd = this.sentenceToCommand( s, new ATSConsoleCommand() );
                commands.push( cmd );
                continue;
            }

            // options have "script"

            let query = s.values[ 0 ];
            let found: boolean = false;
            // Find database names inside
            for ( let i in dbVarNames ) {

                let dbVar = dbVarNames[ i ];
                if ( query.toString().toLowerCase().indexOf( dbVar.toLowerCase() ) < 0 ) {
                    continue;
                }

                found = true;

                // Found
                let dbName = dbNames[ i ];
                let db = spec.databaseWithName( dbName );
                if ( ! db ) {
                    console.log( 'ERROR: database not found with name:', dbName );
                    continue;
                }

                // Remove database name
                query = query.toString().replace( makeDbNameRegex( dbName ), '' );

                let cmd = this.sentenceToCommand( s, new ATSDatabaseCommand(), [ dbName, query ] );
                commands.push( cmd );

                break;
            }

            if ( ! found ) {
                commands.push( this.sentenceToCommand( s ) );
            }
        }

        return commands;
    }

}