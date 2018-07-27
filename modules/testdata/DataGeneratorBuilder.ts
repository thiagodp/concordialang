import { ValueType } from "../util/ValueTypeDetector";
import { RawDataGenerator } from "./raw/RawDataGenerator";
import { StringGenerator } from "./raw/StringGenerator";
import { LongGenerator } from "./raw/LongGenerator";
import { DoubleGenerator } from "./raw/DoubleGenerator";
import { DateGenerator } from "./raw/DateGenerator";
import { TimeGenerator } from "./raw/TimeGenerator";
import { DateTimeGenerator } from "./raw/DateTimeGenerator";
import { RandomString } from "./random/RandomString";
import { Random } from "./random/Random";
import { RandomLong } from "./random/RandomLong";
import { RandomDouble } from "./random/RandomDouble";
import { RandomDate } from "./random/RandomDate";
import { RandomTime } from "./random/RandomTime";
import { RandomDateTime } from "./random/RandomDateTime";
import { RangeAnalyzer } from "./raw/RangeAnalyzer";
import { RegexBasedDataGenerator } from "./RegexBasedDataGenerator";
import { ListBasedDataGenerator } from "./ListBasedDataGenerator";
import { QueryBasedDataGenerator } from "./QueryBasedDataGenerator";
import { Queryable } from "../req/Queryable";
import { QueryCache } from "../db/QueryCache";
import { InvertedLogicListBasedDataGenerator } from "./InvertedLogicListBasedDataGenerator";
import { InvertedLogicQueryBasedDataGenerator } from "./InvertedLogicQueryBasedDataGenerator";

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
    private readonly _randomDateTime: RandomDateTime;

    private readonly _queryCache: QueryCache = new QueryCache();


    constructor(
        private readonly _seed: string,
        private readonly _randomTriesToInvalidValues: number = 10,
        private readonly _maxPossibleStringLength?: number
    ) {
        this._random = new Random( this._seed );
        this._randomString = new RandomString( this._random );
        this._randomLong = new RandomLong( this._random );
        this._randomDouble = new RandomDouble( this._random );
        this._randomDate = new RandomDate( this._randomLong );
        this._randomTime = new RandomTime( this._randomLong );
        this._randomDateTime = new RandomDateTime( this._randomLong );
    }

	raw( valueType: ValueType, min?: any, max?: any ): RawDataGenerator< any > {
		switch ( valueType ) {
			case ValueType.STRING: return new StringGenerator( this._randomString, min, max, this._maxPossibleStringLength );
			case ValueType.INTEGER: return new LongGenerator( this._randomLong, min, max );
			case ValueType.DOUBLE: return new DoubleGenerator( this._randomDouble, min, max );
			case ValueType.DATE: return new DateGenerator( this._randomDate, min, max );
			case ValueType.TIME: return new TimeGenerator(this._randomTime, min, max );
			case ValueType.DATETIME: return new DateTimeGenerator( this._randomDateTime, min, max );
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
        queriable: Queryable
    ): QueryBasedDataGenerator< any > {
        return new QueryBasedDataGenerator( this._randomLong, this.raw( valueType ), queriable, this.queryCache, query, this._randomTriesToInvalidValues );
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