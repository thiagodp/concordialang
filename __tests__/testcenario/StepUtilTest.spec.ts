import * as arrayMove from 'array-move';
import * as deepcopy from 'deepcopy';
import { Step } from 'concordialang-types/ast';
import { Entities } from 'concordialang-types/nlp';
import { StepUtil } from "../../modules/testscenario/StepUtil";
import { NodeTypes } from '../../modules/req/NodeTypes';
import { KeywordDictionary } from '../../modules/dict/KeywordDictionary';
import { EnglishKeywordDictionary } from '../../modules/dict/EnglishKeywordDictionary';


describe( 'StepUtilTest', () => {

    let util: StepUtil = null;
    let keywords: KeywordDictionary = new EnglishKeywordDictionary();

    beforeEach( () => {
        util = new StepUtil();
    } );

    afterEach( () => {
        util = null;
    } );

    it( 'does not move when there is nothing to move', () => {

        let steps = [
            { nodeType: NodeTypes.STEP_GIVEN } as Step,
            { nodeType: NodeTypes.STEP_AND } as Step,
            { nodeType: NodeTypes.STEP_AND } as Step,
            { nodeType: NodeTypes.STEP_WHEN } as Step,
            { nodeType: NodeTypes.STEP_AND } as Step,
            { nodeType: NodeTypes.STEP_AND } as Step,
            { nodeType: NodeTypes.STEP_THEN } as Step,
            { nodeType: NodeTypes.STEP_AND } as Step
        ];

        const before = steps.slice( 0 ); // as is
        steps = util.movePreconditionStepsToTheBeginning( steps, keywords );

        expect( steps ).toEqual( before );
    } );

    it( 'does not move when it does not have precondition', () => {

        let steps = [
            { nodeType: NodeTypes.STEP_WHEN } as Step,
            { nodeType: NodeTypes.STEP_AND } as Step,
            { nodeType: NodeTypes.STEP_AND } as Step,
            { nodeType: NodeTypes.STEP_GIVEN } as Step,
            { nodeType: NodeTypes.STEP_AND } as Step,
            { nodeType: NodeTypes.STEP_AND } as Step,
            { nodeType: NodeTypes.STEP_THEN } as Step,
            { nodeType: NodeTypes.STEP_AND } as Step
        ];

        let expected = deepcopy( steps );
        let result = util.movePreconditionStepsToTheBeginning( steps, keywords );
        expect( result ).toEqual( expected );
    } );

    it( 'moves a GIVEN with a precondition and updates an AND that follows it to become a GIVEN', () => {

        let steps = [
            { nodeType: NodeTypes.STEP_WHEN, values: [ 'a' ] } as Step,
            { nodeType: NodeTypes.STEP_AND, values: [ 'b' ] } as Step,
            { nodeType: NodeTypes.STEP_AND, values: [ 'c' ] } as Step,
            { nodeType: NodeTypes.STEP_GIVEN, values: [ 'd' ], nlpResult: { entities:[ { entity: Entities.STATE, value: 'some state' } ] } } as Step,
            { nodeType: NodeTypes.STEP_AND, values: [ 'e' ] } as Step,
            { nodeType: NodeTypes.STEP_AND, values: [ 'f' ] } as Step,
            { nodeType: NodeTypes.STEP_THEN, values: [ 'g' ] } as Step,
            { nodeType: NodeTypes.STEP_AND, values: [ 'h' ] } as Step
        ];

        let expected = deepcopy( steps );
        // Move Given to the beginning
        expected = arrayMove( expected, 3, 0 );
        // Change the next AND to become a GIVEN
        expected[ 4 ].nodeType = NodeTypes.STEP_GIVEN;

        let result = util.movePreconditionStepsToTheBeginning( steps, keywords );
        expect( result ).toEqual( expected );
    } );


    it( 'moves an AND with a precondition and updates an AND that follows it to become a GIVEN', () => {

        let steps = [
            { nodeType: NodeTypes.STEP_WHEN, values: [ 'a' ] } as Step,
            { nodeType: NodeTypes.STEP_AND, values: [ 'b' ] } as Step,
            { nodeType: NodeTypes.STEP_AND, values: [ 'c' ] } as Step,
            { nodeType: NodeTypes.STEP_GIVEN, values: [ 'd' ] } as Step,
            { nodeType: NodeTypes.STEP_AND, values: [ 'e' ], nlpResult: { entities:[ { entity: Entities.STATE, value: 'some state' } ] } } as Step,
            { nodeType: NodeTypes.STEP_AND, values: [ 'f' ] } as Step,
            { nodeType: NodeTypes.STEP_THEN, values: [ 'g' ] } as Step,
            { nodeType: NodeTypes.STEP_AND, values: [ 'h' ] } as Step
        ];

        let expected = deepcopy( steps );

        // Make AND to become a GIVEN
        expected[ 4 ].nodeType = NodeTypes.STEP_GIVEN;
        // Move it to the beginning
        expected = arrayMove( expected, 4, 0 );
        // Change the next AND to become a GIVEN
        expected[ 5 ].nodeType = NodeTypes.STEP_GIVEN;

        let result = util.movePreconditionStepsToTheBeginning( steps, keywords );
        expect( result ).toEqual( expected );
    } );


    it( 'moves after existing steps with preconditions', () => {

        let steps = [
            { nodeType: NodeTypes.STEP_GIVEN, values: [ 'a' ], nlpResult: { entities:[ { entity: Entities.STATE, value: 'foo' } ] } } as Step,
            { nodeType: NodeTypes.STEP_WHEN, values: [ 'b' ] } as Step,
            { nodeType: NodeTypes.STEP_AND, values: [ 'c' ] } as Step,
            { nodeType: NodeTypes.STEP_AND, values: [ 'd' ] } as Step,
            { nodeType: NodeTypes.STEP_GIVEN, values: [ 'e' ], nlpResult: { entities:[ { entity: Entities.STATE, value: 'bar' } ] } } as Step,
            { nodeType: NodeTypes.STEP_AND, values: [ 'f' ], nlpResult: { entities:[ { entity: Entities.STATE, value: 'baz' } ] } } as Step,
            { nodeType: NodeTypes.STEP_AND, values: [ 'g' ] } as Step,
            { nodeType: NodeTypes.STEP_THEN, values: [ 'h' ] } as Step,
            { nodeType: NodeTypes.STEP_AND, values: [ 'i' ] } as Step
        ];

        let expected = deepcopy( steps );

        // Move it to the second step
        expected = arrayMove( expected, 4, 1 );
        // Change the next AND to become a GIVEN
        expected[ 5 ].nodeType = NodeTypes.STEP_GIVEN;
        expected = arrayMove( expected, 5, 2 );
        // Change the next AND to become a GIVEN
        expected[ 6 ].nodeType = NodeTypes.STEP_GIVEN;

        let result = util.movePreconditionStepsToTheBeginning( steps, keywords );
        expect( result ).toEqual( expected );
    } );

} );