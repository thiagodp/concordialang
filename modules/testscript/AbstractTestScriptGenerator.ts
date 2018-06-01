import { TestCase } from "../ast/TestCase";
import { Document } from '../ast/Document';
import { isDefined } from "../util/TypeChecking";
import { AbstractTestScript, ATSElement, NamedATSElement, ATSTestCase, ATSCommand } from "./AbstractTestScript";
import { Spec } from "../ast/Spec";
import { TagUtil } from "../util/TagUtil";
import { ReservedTags } from "../req/ReservedTags";
import { Location } from "../ast/Location";
import { Entities } from "../nlp/Entities";

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

        // Get from the document
        let feature = ! doc.feature ? null : doc.feature;

        if ( ! feature ) {

            const docsWithFeature = spec.importedDocumentsOf( doc )
                .filter( impDoc => isDefined( impDoc.feature ) );

            // Not found -> get the first feature of a imported document
            if ( docsWithFeature.length > 0 ) {
                feature = docsWithFeature[ 0 ].feature;
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

        // test cases
        for ( let tc of doc.testCases ) {

            let absTC = new ATSTestCase( tc.location, tc.name );

            absTC.scenario = scenarioNames[ ( tc.declaredScenarioIndex || 1 ) - 1 ] || 'Unknown scenario';
            absTC.invalid = tc.shoudFail;

            for ( let sentence of tc.sentences ) {

                let cmd = new ATSCommand();
                cmd.location = sentence.location;
                cmd.action = sentence.action;
                cmd.modifier = sentence.actionModifier;
                cmd.options = sentence.actionOptions;
                cmd.targets = sentence.targets;
                cmd.targetTypes = sentence.targetTypes;
                cmd.values = sentence.values;
                cmd.invalid = sentence.isInvalidValue;
                cmd.comment = sentence.comment;

                absTC.commands.push( cmd );
            }

            // console.log( absTC );

            ats.testcases.push( absTC );
        }

        // before all
        // after all

        // before feature
        // after feature

        // before each scenario
        // after each scenario

        return ats;
    }

}