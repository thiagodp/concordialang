import { Queryable } from "../req/Queryable";
import { ValueType, ValueTypeDetector } from "../util/ValueTypeDetector";
import { DataGeneratorBuilder } from "./DataGeneratorBuilder";
import { DataTestCase } from "./DataTestCase";
import { isDefined } from "../util/TypeChecking";
import { RawDataGenerator } from "./raw/RawDataGenerator";
import { RegexBasedDataGenerator } from "./RegexBasedDataGenerator";
import { QueryBasedDataGenerator } from "./QueryBasedDataGenerator";
import { ListBasedDataGenerator } from "./ListBasedDataGenerator";
import { EntityValueType } from "../ast/UIElement";
import { InvertedLogicQueryBasedDataGenerator } from "./InvertedLogicQueryBasedDataGenerator";
import { InvertedLogicListBasedDataGenerator } from "./InvertedLogicListBasedDataGenerator";
import * as deepcopy from 'deepcopy';

/**
 * Configuration (restrictions) used for generating test data.
 *
 * @author Thiago Delgado Pinto
 */
export class DataGenConfig {

	public required: boolean = false;

	public minValue: any = null;
	public maxValue: any = null;

	public minLength: number = null;
	public maxLength: number = null;

	public format: string = null; // regex

	// public query: string = null;
	// public queryable: Queryable = null; // queriable to use to query the value - db or memory

	public value: EntityValueType = null; // for value and list-based generation
	public invertedLogic: boolean = false; // for list-based generation, when operator "not in" is used

	public computedBy: string = null; // expression

	constructor(
		private _valueType: ValueType = ValueType.STRING
	) {
	}

	// mininum value or length
	get min() {
		return isDefined( this.minValue ) ? this.minValue : this.minLength;
	}

	// maximum value or length
	get max() {
		return isDefined( this.maxValue ) ? this.maxValue : this.maxLength;
	}

	set valueType( valType: ValueType ) {
		this._valueType = valType;
	}

	get valueType() {

		// console.log( '  internal type', this._valueType, 'minValue', this.minValue, 'maxValue', this.maxValue, 'value', this.value );

		if ( isDefined( this.minValue ) ) {
			return ( new ValueTypeDetector() ).detect( this.minValue );
		}

		if ( isDefined( this.maxValue ) ) {
			return ( new ValueTypeDetector() ).detect( this.maxValue );
		}

		if ( isDefined( this.value ) ) {
			const detector = new ValueTypeDetector();
			if ( ! Array.isArray( this.value ) ) {
				return detector.detect( this.value.toString() );
			}
			if ( this.value.length > 0 ) {
				return detector.detect( this.value[ 0 ] );
			}
		}

		return this._valueType;
	}

}


/**
 * Data generator
 *
 * @author Thiago Delgado Pinto
 */
export class DataGenerator {

	constructor(
		private readonly _builder: DataGeneratorBuilder
	) {
	}

	/**
	 * Generates a value, according to the given test case and configuration.
	 *
	 * @param tc Target test case
	 * @param cfg Configuration
	 */
	public async generate( tc: DataTestCase, cfg: DataGenConfig ): Promise< any > {

		// console.log( '-> tc is', tc, 'cfg', cfg );

		switch ( tc ) {

			// VALUE or LENGTH

			case DataTestCase.VALUE_LOWEST:
			case DataTestCase.LENGTH_LOWEST:
				return this.rawGeneratorFor( cfg ).lowest();

			case DataTestCase.VALUE_RANDOM_BELOW_MIN:
				return this.rawGeneratorFor( cfg ).randomBelowMin();

			case DataTestCase.LENGTH_RANDOM_BELOW_MIN: {
				// Generates a random number between 1 and min value
				if ( cfg.required && isDefined( cfg.minValue ) ) {
					let newCfg = deepcopy( cfg ) as DataGenConfig;
					newCfg.minValue = 1;
					newCfg.maxValue = cfg.minValue;
					return this.rawGeneratorFor( newCfg ).randomBetweenMinAndMax();
				}
				return this.rawGeneratorFor( cfg ).randomBelowMin();
			}

			case DataTestCase.VALUE_JUST_BELOW_MIN:
			case DataTestCase.LENGTH_JUST_BELOW_MIN:
				return this.rawGeneratorFor( cfg ).justBelowMin();

			case DataTestCase.VALUE_MIN:
			case DataTestCase.LENGTH_MIN:
				return this.rawGeneratorFor( cfg ).min();

			case DataTestCase.VALUE_JUST_ABOVE_MIN:
			case DataTestCase.LENGTH_JUST_ABOVE_MIN:
				return this.rawGeneratorFor( cfg ).justAboveMin();

			case DataTestCase.VALUE_ZERO:
			//case DataTestCase.LENGTH_ZERO:
				return this.rawGeneratorFor( cfg ).zero();

			case DataTestCase.VALUE_MEDIAN:
			case DataTestCase.LENGTH_MEDIAN:
				return this.rawGeneratorFor( cfg ).median();

			case DataTestCase.VALUE_RANDOM_BETWEEN_MIN_MAX:
			case DataTestCase.LENGTH_RANDOM_BETWEEN_MIN_MAX:
				return this.rawGeneratorFor( cfg ).randomBetweenMinAndMax();

			case DataTestCase.VALUE_JUST_BELOW_MAX:
			case DataTestCase.LENGTH_JUST_BELOW_MAX:
				return this.rawGeneratorFor( cfg ).justBelowMax();

			case DataTestCase.VALUE_MAX:
			case DataTestCase.LENGTH_MAX:
				return this.rawGeneratorFor( cfg ).max();

			case DataTestCase.VALUE_JUST_ABOVE_MAX:
			case DataTestCase.LENGTH_JUST_ABOVE_MAX:
				return this.rawGeneratorFor( cfg ).justAboveMax();

			case DataTestCase.VALUE_RANDOM_ABOVE_MAX:
			case DataTestCase.LENGTH_RANDOM_ABOVE_MAX:
				return this.rawGeneratorFor( cfg ).randomAboveMax();

			case DataTestCase.VALUE_GREATEST:
			case DataTestCase.LENGTH_GREATEST:
				return this.rawGeneratorFor( cfg ).greatest();

			// FORMAT

			case DataTestCase.FORMAT_VALID:
				return this.regexGeneratorFor( cfg ).valid();

			case DataTestCase.FORMAT_INVALID:
				return this.regexGeneratorFor( cfg ).invalid();

			// SET

			case DataTestCase.SET_FIRST_ELEMENT: {
				// if ( isDefined( cfg.query ) ) {
				// 	return await this.queryGeneratorFor( cfg ).firstElement();
				// }
				return this.listGeneratorFor( cfg ).firstElement();
			}

			case DataTestCase.SET_RANDOM_ELEMENT: {
				// if ( isDefined( cfg.query ) ) {
				// 	return await this.queryGeneratorFor( cfg ).randomElement();
				// }
				return this.listGeneratorFor( cfg ).randomElement();
			}

			case DataTestCase.SET_LAST_ELEMENT: {
				// if ( isDefined( cfg.query ) ) {
				// 	return await this.queryGeneratorFor( cfg ).lastElement();
				// }
				return this.listGeneratorFor( cfg ).lastElement();
			}

			case DataTestCase.SET_NOT_IN_SET: {
				// if ( isDefined( cfg.query ) ) {
				// 	return await this.queryGeneratorFor( cfg ).notInSet();
				// }
				return this.listGeneratorFor( cfg ).notInSet();
			}

			// REQUIRED

			case DataTestCase.REQUIRED_FILLED: {
				// if ( isDefined( cfg.query ) || ( isDefined( cfg.value ) && Array.isArray( cfg.value ) ) ) {
				// 	return await this.generate( DataTestCase.SET_RANDOM_ELEMENT, cfg );
				// } else if ( isDefined( cfg.value ) && ! Array.isArray( cfg.value ) ) {
				// 	return await this.generate( DataTestCase.SET_FIRST_ELEMENT, cfg );
				// }
				// return this.rawGeneratorFor( cfg ).randomBetweenMinAndMax();

				if ( isDefined( cfg.value ) ) {
					const dtc = Array.isArray( cfg.value ) ? DataTestCase.SET_RANDOM_ELEMENT : DataTestCase.SET_FIRST_ELEMENT;
					return await this.generate( dtc, cfg );
				}
				return this.rawGeneratorFor( cfg ).randomBetweenMinAndMax();
			}

			case DataTestCase.REQUIRED_NOT_FILLED: {
				return ''; // empty value
			}

			// COMPUTATION
			// TO-DO: computation

			default: return null;
		}
	}


	private rawGeneratorFor( cfg: DataGenConfig ): RawDataGenerator< any > {
		// console.log( cfg.valueType, cfg.min, cfg.max );
		return this._builder.raw( cfg.valueType, cfg.min, cfg.max );
	}

	private regexGeneratorFor( cfg: DataGenConfig ): RegexBasedDataGenerator {
		return this._builder.regex( cfg.valueType, cfg.format );
	}

	// private queryGeneratorFor( cfg: DataGenConfig ): QueryBasedDataGenerator< any > | InvertedLogicQueryBasedDataGenerator< any > {
	// 	if ( true === cfg.invertedLogic ) {
	// 		return this._builder.invertedLogicQuery( cfg.valueType, cfg.query, cfg.queryable );
	// 	}
	// 	return this._builder.query( cfg.valueType, cfg.query, cfg.queryable );
	// }

	private listGeneratorFor( cfg: DataGenConfig ): ListBasedDataGenerator< any > | InvertedLogicListBasedDataGenerator< any > {
		if ( true === cfg.invertedLogic ) {
			return this._builder.invertedLogicList( cfg.valueType, Array.isArray( cfg.value ) ? cfg.value : [ cfg.value ] );
		}
		return this._builder.list( cfg.valueType, Array.isArray( cfg.value ) ? cfg.value : [ cfg.value ] );
	}


}