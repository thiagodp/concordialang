import { QueryCache } from '../db/QueryCache';
import { Queryable } from '../dbi/Queryable';
import { ValueType } from '../util/ValueTypeDetector';
import { InvertedLogicListBasedDataGenerator } from './InvertedLogicListBasedDataGenerator';
import { InvertedLogicQueryBasedDataGenerator } from './InvertedLogicQueryBasedDataGenerator';
import { ListBasedDataGenerator } from './ListBasedDataGenerator';
import { QueryBasedDataGenerator } from './QueryBasedDataGenerator';
import { Random } from './random/Random';
import { RandomDate } from './random/RandomDate';
import { RandomDateTime } from './random/RandomDateTime';
import { RandomDouble } from './random/RandomDouble';
import { RandomLong } from './random/RandomLong';
import { RandomShortDateTime } from './random/RandomShortDateTime';
import { RandomShortTime } from './random/RandomShortTime';
import { RandomString } from './random/RandomString';
import { RandomTime } from './random/RandomTime';
import { DateGenerator } from './raw/DateGenerator';
import { DateTimeGenerator } from './raw/DateTimeGenerator';
import { DoubleGenerator } from './raw/DoubleGenerator';
import { LongGenerator } from './raw/LongGenerator';
import { RangeAnalyzer } from './raw/RangeAnalyzer';
import { RawDataGenerator } from './raw/RawDataGenerator';
import { ShortDateTimeGenerator } from './raw/ShortDateTimeGenerator';
import { ShortTimeGenerator } from './raw/ShortTimeGenerator';
import { StringGenerator } from './raw/StringGenerator';
import { TimeGenerator } from './raw/TimeGenerator';
import { RegexBasedDataGenerator } from './RegexBasedDataGenerator';

/**
 * Data generator builder
 *
 * @author Thiago Delgado Pinto
 */
export class DataGeneratorBuilder {

    private readonly _random: Random;
    private readonly _randomString: RandomString;
    private readonly _randomLong: RandomLong;
    private readonly _randomDouble: RandomDouble;
    private readonly _randomDate: RandomDate;
    private readonly _randomTime: RandomTime;
    private readonly _randomShortTime: RandomShortTime;
    private readonly _randomDateTime: RandomDateTime;
    private readonly _randomShortDateTime: RandomShortDateTime;

    private readonly _queryCache: QueryCache = new QueryCache();


    constructor(
        private readonly _seed: string,
        private readonly _randomTriesToInvalidValues: number = 10,
        private readonly _maxPossibleStringLength?: number
    ) {
        this._random = new Random( this._seed );
        this._randomString = new RandomString( this._random, { escapeChars: true, avoidDatabaseChars: true } );
        this._randomLong = new RandomLong( this._random );
        this._randomDouble = new RandomDouble( this._random );
        this._randomDate = new RandomDate( this._randomLong );
        this._randomTime = new RandomTime( this._randomLong );
        this._randomShortTime = new RandomShortTime( this._randomLong );
        this._randomDateTime = new RandomDateTime( this._randomLong );
        this._randomShortDateTime = new RandomShortDateTime( this._randomLong );
    }

	raw( valueType: ValueType, min?: any, max?: any ): RawDataGenerator< any > {
        // console.log( 'generator for valueType', valueType, 'min', min, 'max', max );
		switch ( valueType ) {
			case ValueType.STRING: return new StringGenerator( this._randomString, min, max, this._maxPossibleStringLength );
			case ValueType.INTEGER: return new LongGenerator( this._randomLong, min, max );
			case ValueType.DOUBLE: return new DoubleGenerator( this._randomDouble, min, max );
			case ValueType.DATE: return new DateGenerator( this._randomDate, min, max );
            case ValueType.TIME: return new ShortTimeGenerator( this._randomShortTime, min, max );
            case ValueType.LONG_TIME: return new TimeGenerator( this._randomTime, min, max );
            case ValueType.DATE_TIME: return new ShortDateTimeGenerator( this._randomShortDateTime, min, max );
            case ValueType.LONG_DATE_TIME: return new DateTimeGenerator( this._randomDateTime, min, max );
			default: throw Error( 'Generator not available fot the type ' + valueType );
		}
    }

	rawAnalyzer( valueType: ValueType, min?: any, max?: any ): RangeAnalyzer {
		return this.raw( valueType, min, max ) as any;
    }

    regex( valueType: ValueType, expression: string ): RegexBasedDataGenerator {
        return new RegexBasedDataGenerator( this._randomLong, this._randomString, expression, valueType, this._randomTriesToInvalidValues );
    }

    list( valueType: ValueType, listValues: any[] ): ListBasedDataGenerator< any > {
        return new ListBasedDataGenerator( this._randomLong, this.raw( valueType ), listValues, this._randomTriesToInvalidValues );
    }

    invertedLogicList( valueType: ValueType, listValues: any[] ): InvertedLogicListBasedDataGenerator< any > {
        return new InvertedLogicListBasedDataGenerator( this.list( valueType, listValues ) );
    }

    query(
        valueType: ValueType,
        query: string,
        queryable: Queryable
    ): QueryBasedDataGenerator< any > {
        return new QueryBasedDataGenerator( this._randomLong, this.raw( valueType ), queryable, this.queryCache, query, this._randomTriesToInvalidValues );
    }

    invertedLogicQuery(
        valueType: ValueType,
        query: string,
        queriable: Queryable
    ): InvertedLogicQueryBasedDataGenerator< any > {
        return new InvertedLogicQueryBasedDataGenerator( this.query( valueType, query, queriable ) );
    }

    get queryCache() {
        return this._queryCache
    }

}