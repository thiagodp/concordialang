import deepcopy from 'deepcopy';

import { Step } from '../../modules/ast/Step';
import { NodeTypes } from '../../modules/req/NodeTypes';
import { StepHandler } from '../../modules/testscenario/StepHandler';

describe( 'StepHandler', () => {

	let handler: StepHandler;

	const LANGUAGE = 'en';

	const _AND = NodeTypes.STEP_AND;
	const _GIVEN = NodeTypes.STEP_GIVEN;
	const _WHEN = NodeTypes.STEP_WHEN;
	const _THEN = NodeTypes.STEP_THEN;
	const _OTHERWISE = NodeTypes.STEP_OTHERWISE;

	beforeAll( () => {
		handler = new StepHandler( LANGUAGE );
	} );

	afterAll( () => {
		handler = null;
	} );


	describe( '#startsWithKeyword', () => {

		it( 'finds without spaces', () => {
			const r = handler.startsWithKeyword( 'given that I see foo', 'given' );
			expect( r ).toBeTruthy();
		} );

		it( 'finds with a space', () => {
			const r = handler.startsWithKeyword( ' given that I see foo', 'given' );
			expect( r ).toBeTruthy();
		} );

		it( 'finds with a tab', () => {
			const r = handler.startsWithKeyword( '\tgiven that I see foo', 'given' );
			expect( r ).toBeTruthy();
		} );

		it( 'finds with a spaces and tabs', () => {
			const r = handler.startsWithKeyword( ' \t \t given that I see foo', 'given' );
			expect( r ).toBeTruthy();
		} );

		it( 'does not find when starting with another word', () => {
			const r = handler.startsWithKeyword( ' \t \t when given that I see foo', 'given' );
			expect( r ).toBeFalsy();
		} );

	} );

	describe( '#replacePrefix', () => {

		it.each( [
			[ 'And by Given',
				_AND, _GIVEN, 'and I see {X}', 'Given that I see {X}' ],
			[ 'And by Given, case insensitive',
				_AND, _GIVEN, 'AND I see {X}', 'Given that I see {X}' ],
			[ 'And by Given, with spaces',
				_AND, _GIVEN, ' and I see {X}', ' Given that I see {X}' ],
			[ 'And by Given, with tab',
				_AND, _GIVEN, '\tand I see {X}', '\tGiven that I see {X}' ],
			[ 'And by Given, with spaces and tabs',
				_AND, _GIVEN, ' \t \t and I see {X}', ' \t \t Given that I see {X}' ],

			[ 'And with that by Given',
				_AND, _GIVEN, 'and that I see {X}', 'Given that I see {X}' ],

			[ 'And by When',
				_AND, _WHEN, 'and I see {X}', 'When I see {X}' ],

			[ 'And by Then',
				_AND, _THEN, 'and I see {X}', 'Then I see {X}' ],

			[ 'And by Otherwise',
				_AND, _OTHERWISE, 'and I see {X}', 'Otherwise I see {X}' ],

		] )( 'replaces %s', ( comment, search, replace, sentence, expected ) => {

			const r = handler.replacePrefix(
				search,
				replace,
				sentence,
				LANGUAGE
				);

			expect( r ).toEqual( expected );
		} );

	} );


	describe( '#adjustPrefixes', () => {

		it( 'keeps non-repeated sentences', () => {

			const steps = [
				{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo' } as Step,
			];

			const clone = deepcopy( steps );
			handler.adjustPrefixes( steps, LANGUAGE );

			expect( steps ).toEqual( clone );

		} );


		it( 'replaces double Given sentences', () => {

			const steps = [
				{ nodeType: _GIVEN, content: 'Given that foo1' } as Step,
				{ nodeType: _GIVEN, content: 'Given that foo2' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo' } as Step,
			];

			handler.adjustPrefixes( steps, LANGUAGE );

			expect( steps ).toEqual( [
				{ nodeType: _GIVEN, content: 'Given that foo1' } as Step,
				{ nodeType: _AND, content: 'and foo2' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo' } as Step,
			] );

		} );

		it( 'replaces double When sentences', () => {

			const steps = [
				{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar1' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar2' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo' } as Step,
			];

			handler.adjustPrefixes( steps, LANGUAGE );

			expect( steps ).toEqual( [
				{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar1' } as Step,
				{ nodeType: _AND, content: 'and I do bar2' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo' } as Step,
			] );

		} );


		it( 'replaces double Then sentences', () => {

			const steps = [
				{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo1' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo2' } as Step,
			];

			handler.adjustPrefixes( steps, LANGUAGE );

			expect( steps ).toEqual( [
				{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo1' } as Step,
				{ nodeType: _AND, content: 'and I see zoo2' } as Step,
			] );

		} );


		it( 'replaces double Otherwise sentences', () => {

			const steps = [
				{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				{ nodeType: _OTHERWISE, content: 'Otherwise I see zoo1' } as Step,
				{ nodeType: _OTHERWISE, content: 'Otherwise I see zoo2' } as Step,
			];

			handler.adjustPrefixes( steps, LANGUAGE );

			expect( steps ).toEqual( [
				{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				{ nodeType: _OTHERWISE, content: 'Otherwise I see zoo1' } as Step,
				{ nodeType: _AND, content: 'and I see zoo2' } as Step,
			] );

		} );


	} );



	describe( '#removeStep', () => {

		describe( 'removes without adjusting other sentences', () => {

			const steps = [
				{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo' } as Step,
			];

			it( 'removes Given', () => {
				const r0 = handler.removeStep( steps, 0, LANGUAGE );
				expect( r0 ).toEqual( [
					{ nodeType: _WHEN, content: 'When I do bar' } as Step,
					{ nodeType: _THEN, content: 'Then I see zoo' } as Step,
				] );
			} );

			it( 'removes When', () => {
				const r1 = handler.removeStep( steps, 1, LANGUAGE );
				expect( r1 ).toEqual( [
					{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
					{ nodeType: _THEN, content: 'Then I see zoo' } as Step,
				] );
			} );

			it( 'removes Then', () => {
				const r2 = handler.removeStep( steps, 2, LANGUAGE );
				expect( r2 ).toEqual( [
					{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
					{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				] );
			} );

			it( 'removes Otherwise', () => {

				const stepsWithOtherwise = [
					{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
					{ nodeType: _WHEN, content: 'When I do bar' } as Step,
					{ nodeType: _OTHERWISE, content: 'Otherwise I see zoo' } as Step, // 2
				];

				const r2 = handler.removeStep( stepsWithOtherwise, 2, LANGUAGE );
				expect( r2 ).toEqual( [
					{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
					{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				] );
			} );

		} );

		it( 'adjusts And of a Given', () => {

			const steps = [
				{ nodeType: _GIVEN, content: 'Given that foo1' } as Step, // 0
				{ nodeType: _AND, content: 'and I see foo2' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo' } as Step,
			];

			const r = handler.removeStep( steps, 0, LANGUAGE );
			expect( r ).toEqual( [
				{ nodeType: _GIVEN, content: 'Given that I see foo2' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo' } as Step,
			] );
		} );


		it( 'adjusts And of a When', () => {

			const steps = [
				{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar1' } as Step, // 1
				{ nodeType: _AND, content: 'and I do bar2' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo' } as Step,
			];

			const r = handler.removeStep( steps, 1, LANGUAGE );
			expect( r ).toEqual( [
				{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar2' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo' } as Step,
			] );
		} );

		it( 'adjusts And of a Then', () => {

			const steps = [
				{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo1' } as Step, // 2
				{ nodeType: _AND, content: 'and I see zoo2' } as Step,
			];

			const r = handler.removeStep( steps, 2, LANGUAGE );
			expect( r ).toEqual( [
				{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo2' } as Step,
			] );
		} );

		it( 'adjusts And of a Otherwise', () => {

			const steps = [
				{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				{ nodeType: _OTHERWISE, content: 'Otherwise I see zoo1' } as Step, // 2
				{ nodeType: _AND, content: 'and I see zoo2' } as Step,
			];

			const r = handler.removeStep( steps, 2, LANGUAGE );
			expect( r ).toEqual( [
				{ nodeType: _GIVEN, content: 'Given that foo' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				{ nodeType: _OTHERWISE, content: 'Otherwise I see zoo2' } as Step,
			] );
		} );


		it( 'keeps an orphan And', () => {

			const steps = [
				{ nodeType: _AND, content: 'and that foo1' } as Step, // 0
				{ nodeType: _AND, content: 'and that foo2' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo' } as Step,
			];

			const r = handler.removeStep( steps, 0, LANGUAGE );
			expect( r ).toEqual( [
				{ nodeType: _AND, content: 'and that foo2' } as Step,
				{ nodeType: _WHEN, content: 'When I do bar' } as Step,
				{ nodeType: _THEN, content: 'Then I see zoo' } as Step,
			] );
		} );


	} );


	it( 'ignores Given steps with state', () => {

		const steps = [
			{ nodeType: _GIVEN, content: 'Given that I have ~foo~' } as Step,
			{ nodeType: _AND, content: 'and that I see "bar"' } as Step,
			{ nodeType: _WHEN, content: 'When I click <ok>' } as Step,
			{ nodeType: _THEN, content: 'Then I see "Saved"' } as Step,
		];

		const r = handler.stepsExceptExternalOrGivenStepsWithState( steps, LANGUAGE );

		expect( r ).toEqual( [
			{ nodeType: _GIVEN, content: 'Given that I see "bar"' } as Step,
			{ nodeType: _WHEN, content: 'When I click <ok>' } as Step,
			{ nodeType: _THEN, content: 'Then I see "Saved"' } as Step,
		] );
	} );



    // it( 'does not move when there is nothing to move', () => {

    //     let steps = [
    //         { nodeType: NodeTypes.STEP_GIVEN } as Step,
    //         { nodeType: NodeTypes.STEP_AND } as Step,
    //         { nodeType: NodeTypes.STEP_AND } as Step,
    //         { nodeType: NodeTypes.STEP_WHEN } as Step,
    //         { nodeType: NodeTypes.STEP_AND } as Step,
    //         { nodeType: NodeTypes.STEP_AND } as Step,
    //         { nodeType: NodeTypes.STEP_THEN } as Step,
    //         { nodeType: NodeTypes.STEP_AND } as Step
    //     ];

    //     const before = steps.slice( 0 ); // as is
    //     steps = util.movePreconditionStepsToTheBeginning( steps, keywords );

    //     expect( steps ).toEqual( before );
    // } );

    // it( 'does not move when it does not have precondition', () => {

    //     let steps = [
    //         { nodeType: NodeTypes.STEP_WHEN } as Step,
    //         { nodeType: NodeTypes.STEP_AND } as Step,
    //         { nodeType: NodeTypes.STEP_AND } as Step,
    //         { nodeType: NodeTypes.STEP_GIVEN } as Step,
    //         { nodeType: NodeTypes.STEP_AND } as Step,
    //         { nodeType: NodeTypes.STEP_AND } as Step,
    //         { nodeType: NodeTypes.STEP_THEN } as Step,
    //         { nodeType: NodeTypes.STEP_AND } as Step
    //     ];

    //     let expected = deepcopy( steps );
    //     let result = util.movePreconditionStepsToTheBeginning( steps, keywords );
    //     expect( result ).toEqual( expected );
    // } );

    // it( 'moves a GIVEN with a precondition and updates an AND that follows it to become a GIVEN', () => {

    //     let steps = [
    //         { nodeType: NodeTypes.STEP_WHEN, values: [ 'a' ] } as Step,
    //         { nodeType: NodeTypes.STEP_AND, values: [ 'b' ] } as Step,
    //         { nodeType: NodeTypes.STEP_AND, values: [ 'c' ] } as Step,
    //         { nodeType: NodeTypes.STEP_GIVEN, values: [ 'd' ], nlpResult: { entities:[ { entity: Entities.STATE, value: 'some state' } ] } } as Step,
    //         { nodeType: NodeTypes.STEP_AND, values: [ 'e' ] } as Step,
    //         { nodeType: NodeTypes.STEP_AND, values: [ 'f' ] } as Step,
    //         { nodeType: NodeTypes.STEP_THEN, values: [ 'g' ] } as Step,
    //         { nodeType: NodeTypes.STEP_AND, values: [ 'h' ] } as Step
    //     ];

    //     let expected = deepcopy( steps );
    //     // Move Given to the beginning
    //     expected = arrayMove( expected, 3, 0 );
    //     // Change the next AND to become a GIVEN
    //     expected[ 4 ].nodeType = NodeTypes.STEP_GIVEN;

    //     let result = util.movePreconditionStepsToTheBeginning( steps, keywords );
    //     expect( result ).toEqual( expected );
    // } );


    // it( 'moves an AND with a precondition and updates an AND that follows it to become a GIVEN', () => {

    //     let steps = [
    //         { nodeType: NodeTypes.STEP_WHEN, values: [ 'a' ] } as Step,
    //         { nodeType: NodeTypes.STEP_AND, values: [ 'b' ] } as Step,
    //         { nodeType: NodeTypes.STEP_AND, values: [ 'c' ] } as Step,
    //         { nodeType: NodeTypes.STEP_GIVEN, values: [ 'd' ] } as Step,
    //         { nodeType: NodeTypes.STEP_AND, values: [ 'e' ], nlpResult: { entities:[ { entity: Entities.STATE, value: 'some state' } ] } } as Step,
    //         { nodeType: NodeTypes.STEP_AND, values: [ 'f' ] } as Step,
    //         { nodeType: NodeTypes.STEP_THEN, values: [ 'g' ] } as Step,
    //         { nodeType: NodeTypes.STEP_AND, values: [ 'h' ] } as Step
    //     ];

    //     let expected = deepcopy( steps );

    //     // Make AND to become a GIVEN
    //     expected[ 4 ].nodeType = NodeTypes.STEP_GIVEN;
    //     // Move it to the beginning
    //     expected = arrayMove( expected, 4, 0 );
    //     // Change the next AND to become a GIVEN
    //     expected[ 5 ].nodeType = NodeTypes.STEP_GIVEN;

    //     let result = util.movePreconditionStepsToTheBeginning( steps, keywords );
    //     expect( result ).toEqual( expected );
    // } );


    // it( 'moves after existing steps with preconditions', () => {

    //     let steps = [
    //         { nodeType: NodeTypes.STEP_GIVEN, values: [ 'a' ], nlpResult: { entities:[ { entity: Entities.STATE, value: 'foo' } ] } } as Step,
    //         { nodeType: NodeTypes.STEP_WHEN, values: [ 'b' ] } as Step,
    //         { nodeType: NodeTypes.STEP_AND, values: [ 'c' ] } as Step,
    //         { nodeType: NodeTypes.STEP_AND, values: [ 'd' ] } as Step,
    //         { nodeType: NodeTypes.STEP_GIVEN, values: [ 'e' ], nlpResult: { entities:[ { entity: Entities.STATE, value: 'bar' } ] } } as Step,
    //         { nodeType: NodeTypes.STEP_AND, values: [ 'f' ], nlpResult: { entities:[ { entity: Entities.STATE, value: 'baz' } ] } } as Step,
    //         { nodeType: NodeTypes.STEP_AND, values: [ 'g' ] } as Step,
    //         { nodeType: NodeTypes.STEP_THEN, values: [ 'h' ] } as Step,
    //         { nodeType: NodeTypes.STEP_AND, values: [ 'i' ] } as Step
    //     ];

    //     let expected = deepcopy( steps );

    //     // Move it to the second step
    //     expected = arrayMove( expected, 4, 1 );
    //     // Change the next AND to become a GIVEN
    //     expected[ 5 ].nodeType = NodeTypes.STEP_GIVEN;
    //     expected = arrayMove( expected, 5, 2 );
    //     // Change the next AND to become a GIVEN
    //     expected[ 6 ].nodeType = NodeTypes.STEP_GIVEN;

    //     let result = util.movePreconditionStepsToTheBeginning( steps, keywords );
    //     expect( result ).toEqual( expected );
    // } );

} );
