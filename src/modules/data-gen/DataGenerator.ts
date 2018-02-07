// WIP !!!

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

/**
 * Data analysis result
 * 
 * @author Thiago Delgado Pinto
 */
export enum DataAnalysisResult {
	NOT_AVAILABLE,
	VALID,
	INVALID
}


/**
 * Data generator
 * 
 * @author Thiago Delgado Pinto
 */
export class DataGenerator {

	private readonly _dataTestCaseVsValueType: DataTestCaseVsValueType =
		new DataTestCaseVsValueType();


	constructor(
		private readonly _randomLong: RandomLong,
		private readonly _randomDouble: RandomDouble,		
		private readonly _randomString: RandomString
	) {
	}

	
	public analyze( testCase: DataTestCase ): DataAnalysisResult {

		if ( ( new DataTestCaseGroupDef() ).groupOf( testCase ) !== DataTestCaseGroup.VALUE ) {
			return DataAnalysisResult.NOT_AVAILABLE;
		}

		const lowerThanMin = this.isTestCaseLowerThanMin( testCase );
		const greaterThanMax = this.isTestCaseGreaterThanMax( testCase );

		if ( lowerThanMin || greaterThanMax ) {
			return DataAnalysisResult.INVALID;
		} else if ( ! lowerThanMin && ! greaterThanMax ) {
			return DataAnalysisResult.VALID;
		} else {
			return DataAnalysisResult.NOT_AVAILABLE;
		}
	}


	public async generate(
		testCase: DataTestCase,
		valueType: ValueType
	): Promise< any > {

		if ( this._dataTestCaseVsValueType.isCompatible( valueType, testCase ) ) {
			return null;
		}

		switch ( testCase ) {

			case DataTestCase.VALUE_LOWEST:
			case DataTestCase.LENGTH_LOWEST:
				return this.rawGeneratorFor( valueType ).lowest();

			case DataTestCase.VALUE_RANDOM_BELOW_MIN:
			case DataTestCase.LENGTH_RANDOM_BELOW_MIN:			
				return this.rawGeneratorFor( valueType ).randomBelowMin();

			case DataTestCase.VALUE_JUST_BELOW_MIN:
			case DataTestCase.LENGTH_JUST_BELOW_MIN:			
				return this.rawGeneratorFor( valueType ).justBelowMin();

			case DataTestCase.VALUE_MIN:
			case DataTestCase.LENGTH_MIN:			
				return this.rawGeneratorFor( valueType ).min();

			case DataTestCase.VALUE_JUST_ABOVE_MIN:
			case DataTestCase.LENGTH_JUST_ABOVE_MIN:
				return this.rawGeneratorFor( valueType ).justAboveMin();

			case DataTestCase.VALUE_ZERO:
			//case DataTestCase.LENGTH_ZERO:
				return this.rawGeneratorFor( valueType ).zero();

			case DataTestCase.VALUE_MEDIAN:
			case DataTestCase.LENGTH_MEDIAN:
				return this.rawGeneratorFor( valueType ).median();
			
			case DataTestCase.VALUE_RANDOM_BETWEEN_MIN_MAX:
			case DataTestCase.LENGTH_RANDOM_BETWEEN_MIN_MAX:
				return this.rawGeneratorFor( valueType ).randomBetweenMinAndMax();
			
			case DataTestCase.VALUE_JUST_BELOW_MAX:
			case DataTestCase.LENGTH_JUST_BELOW_MAX:
				return this.rawGeneratorFor( valueType ).justBelowMax();
			
			case DataTestCase.VALUE_MAX:
			case DataTestCase.LENGTH_MAX:
				return this.rawGeneratorFor( valueType ).max();
			
			case DataTestCase.VALUE_JUST_ABOVE_MAX:
			case DataTestCase.LENGTH_JUST_ABOVE_MAX:
				return this.rawGeneratorFor( valueType ).justAboveMax();
			
			case DataTestCase.VALUE_RANDOM_ABOVE_MAX:
			case DataTestCase.LENGTH_RANDOM_ABOVE_MAX:
				return this.rawGeneratorFor( valueType ).randomAboveMax();

			case DataTestCase.VALUE_GREATEST:
			case DataTestCase.LENGTH_GREATEST:
				return this.rawGeneratorFor( valueType ).greatest();

			default: return null;
		}
	}


	private rawGeneratorFor( valueType: ValueType, min?: any, max?: any ): RawDataGenerator< any > {
		switch ( valueType ) {
			case ValueType.STRING: return new StringGenerator( this._randomString, min, max );
			case ValueType.INTEGER: return new LongGenerator( this._randomLong, min, max );
			case ValueType.DOUBLE: return new DoubleGenerator( this._randomDouble, min, max );
			// ... TO-DO
			default: throw Error( 'Generator not available fot the type ' + valueType );
		}
	}
	

}