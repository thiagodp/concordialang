import { DataTestCase, DataTestCaseGroupDef, DataTestCaseGroup } from './DataTestCase';
import { ValueType } from '../util/ValueTypeDetector';
import { DataTestCaseVsValueType } from './DataTestCaseVsValueType';
import { StringGenerator } from './raw/StringGenerator';
import { RandomString } from './random/RandomString';
import { RandomLong } from './random/RandomLong';
import { RandomDouble } from './random/RandomDouble';
import { LongGenerator } from './raw/LongGenerator';
import { RawDataGenerator } from './raw/RawDataGenerator';
import { DoubleGenerator } from './raw/DoubleGenerator';
import { RegexBasedDataGenerator } from './RegexBasedDataGenerator';
import { QueryBasedDataGenerator } from './QueryBasedDataGenerator';
import { QueryCache } from '../db/QueryCache';
import { ListBasedDataGenerator } from './ListBasedDataGenerator';
import { Random } from './random/Random';
import { Queryable } from '../db/Queryable';
import { isDefined } from '../util/TypeChecking';
import { DateGenerator } from './raw/DateGenerator';
import { RandomDate } from './random/RandomDate';
import { TimeGenerator } from './raw/TimeGenerator';
import { RandomTime } from './random/RandomTime';
import { DateTimeGenerator } from './raw/DateTimeGenerator';
import { RandomDateTime } from './random/RandomDateTime';

/**
 * Indicates the result of a test case.
 * 
 * @author Thiago Delgado Pinto
 */
export enum DataAnalysisResult {
	NOT_AVAILABLE,
	VALID,
	INVALID
}


/**
 * Configuration (restrictions) used for generating test data.
 * 
 * @author Thiago Delgado Pinto
 */
export class DataGenConfig {

	public min: any = null; // mininum value or length
	public max: any = null; // mininum value or length

	public regex: string = null;

	public query: string = null;
	public queryable: Queryable = null; // queriable to use to query the value - db or memory

	public listOfValues: any[] = null; // for list-based generation

	constructor(
		public valueType: ValueType = ValueType.STRING
	) {
	}

}


/**
 * Data generator
 * 
 * @author Thiago Delgado Pinto
 */
export class DataGenerator {

	private readonly _randomLong: RandomLong;
	private readonly _randomDouble: RandomDouble;		
	private readonly _randomString: RandomString;	

	private readonly _dataTestCaseVsValueType: DataTestCaseVsValueType =
		new DataTestCaseVsValueType();

	private readonly _queryCache: QueryCache = new QueryCache();


	constructor( private _random: Random ) {
		this._randomLong = new RandomLong( _random );
		this._randomDouble = new RandomDouble( _random );
		this._randomString = new RandomString( _random );
	}

	/**
	 * Analyzes whether a data can be considered valid or invalid according to the given test case.
	 * 
	 * @param testCase Test case to analyze
	 */
	public analyze( testCase: DataTestCase ): DataAnalysisResult {

		if ( ( new DataTestCaseGroupDef() ).groupOf( testCase ) !== DataTestCaseGroup.VALUE ) {
			return DataAnalysisResult.NOT_AVAILABLE;
		}

		// TO-DO

		// const lowerThanMin = this.isTestCaseLowerThanMin( testCase );
		// const greaterThanMax = this.isTestCaseGreaterThanMax( testCase );

		// if ( lowerThanMin || greaterThanMax ) {
		// 	return DataAnalysisResult.INVALID;
		// } else if ( ! lowerThanMin && ! greaterThanMax ) {
		// 	return DataAnalysisResult.VALID;
		// } else {
		// 	return DataAnalysisResult.NOT_AVAILABLE;
		// }
	}


	/**
	 * Generates a value, according to the given test case and configuration.
	 * 
	 * @param testCase Target test case
	 * @param cfg Configuration
	 */
	public async generate( testCase: DataTestCase, cfg: DataGenConfig ): Promise< any > {

		if ( ! this._dataTestCaseVsValueType.isCompatible( cfg.valueType, testCase ) ) {
			return null;
		}

		switch ( testCase ) {

			// VALUE or LENGTH

			case DataTestCase.VALUE_LOWEST:
			case DataTestCase.LENGTH_LOWEST:
				return this.rawGeneratorFor( cfg ).lowest();

			case DataTestCase.VALUE_RANDOM_BELOW_MIN:
			case DataTestCase.LENGTH_RANDOM_BELOW_MIN:			
				return this.rawGeneratorFor( cfg ).randomBelowMin();

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
				if ( isDefined( cfg.query ) ) {
					return await this.queryGeneratorFor( cfg ).firstElement();
				}
				return this.listGeneratorFor( cfg ).firstElement();
			}

			case DataTestCase.SET_SECOND_ELEMENT: {
				if ( isDefined( cfg.query ) ) {
					return await this.queryGeneratorFor( cfg ).secondElement();
				}
				return this.listGeneratorFor( cfg ).secondElement();
			}

			case DataTestCase.SET_RANDOM_ELEMENT: {
				if ( isDefined( cfg.query ) ) {
					return await this.queryGeneratorFor( cfg ).randomElement();
				}
				return this.listGeneratorFor( cfg ).randomElement();
			}			

			case DataTestCase.SET_PENULTIMATE_ELEMENT: {
				if ( isDefined( cfg.query ) ) {
					return await this.queryGeneratorFor( cfg ).penultimateElement();
				}
				return this.listGeneratorFor( cfg ).penultimateElement();
			}
			
			case DataTestCase.SET_LAST_ELEMENT: {
				if ( isDefined( cfg.query ) ) {
					return await this.queryGeneratorFor( cfg ).lastElement();
				}
				return this.listGeneratorFor( cfg ).lastElement();
			}
			
			case DataTestCase.SET_NOT_IN_SET: {
				if ( isDefined( cfg.query ) ) {
					return await this.queryGeneratorFor( cfg ).notInSet();
				}
				return this.listGeneratorFor( cfg ).notInSet();
			}			

			// REQUIRED

			case DataTestCase.REQUIRED_FILLED: {
				if ( isDefined( cfg.query ) || isDefined( cfg.listOfValues ) ) {
					return await this.generate( DataTestCase.SET_RANDOM_ELEMENT, cfg );
				}
				return this.rawGeneratorFor( cfg ).randomBetweenMinAndMax();
			}

			case DataTestCase.REQUIRED_NOT_FILLED: {
				return ''; // empty value
			}			

			// COMPUTATION

			// to-do

			default: return null;
		}
	}


	private rawGeneratorFor( cfg: DataGenConfig ): RawDataGenerator< any > {
		switch ( cfg.valueType ) {
			case ValueType.STRING: return new StringGenerator( this._randomString, cfg.min, cfg.max );
			case ValueType.INTEGER: return new LongGenerator( this._randomLong, cfg.min, cfg.max );
			case ValueType.DOUBLE: return new DoubleGenerator( this._randomDouble, cfg.min, cfg.max );
			case ValueType.DATE: return new DateGenerator( new RandomDate( this._randomLong ), cfg.min, cfg.max );
			case ValueType.TIME: return new TimeGenerator( new RandomTime( this._randomLong ), cfg.min, cfg.max );
			case ValueType.DATETIME: return new DateTimeGenerator( new RandomDateTime( this._randomLong ), cfg.min, cfg.max );
			default: throw Error( 'Generator not available fot the type ' + cfg.valueType );
		}
	}

	private regexGeneratorFor( cfg: DataGenConfig ): RegexBasedDataGenerator {
		return new RegexBasedDataGenerator(
			this._randomLong,
			this._randomString,
			cfg.regex
		);
	}
	
	private queryGeneratorFor( cfg: DataGenConfig ): QueryBasedDataGenerator< any > {
		return new QueryBasedDataGenerator(
			this._randomLong,
			this.rawGeneratorFor( cfg ),
			cfg.queryable,
			this._queryCache,
			cfg.query
		);
	}

	private listGeneratorFor( cfg: DataGenConfig ): ListBasedDataGenerator< any > {
		return new ListBasedDataGenerator(
			this._randomLong,
			this.rawGeneratorFor( cfg ),
			cfg.listOfValues
		);
	}
	

}