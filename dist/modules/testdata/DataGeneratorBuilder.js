import { QueryCache } from '../db/QueryCache';
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
    constructor(_seed, _randomTriesToInvalidValues = 10, _maxPossibleStringLength) {
        this._seed = _seed;
        this._randomTriesToInvalidValues = _randomTriesToInvalidValues;
        this._maxPossibleStringLength = _maxPossibleStringLength;
        this._queryCache = new QueryCache();
        this._random = new Random(this._seed);
        this._randomString = new RandomString(this._random, { escapeChars: true, avoidDatabaseChars: true });
        this._randomLong = new RandomLong(this._random);
        this._randomDouble = new RandomDouble(this._random);
        this._randomDate = new RandomDate(this._randomLong);
        this._randomTime = new RandomTime(this._randomLong);
        this._randomShortTime = new RandomShortTime(this._randomLong);
        this._randomDateTime = new RandomDateTime(this._randomLong);
        this._randomShortDateTime = new RandomShortDateTime(this._randomLong);
    }
    raw(valueType, min, max) {
        // console.log( 'generator for valueType', valueType, 'min', min, 'max', max );
        switch (valueType) {
            case ValueType.STRING:
                return new StringGenerator(this._randomString, min, max, this._maxPossibleStringLength);
            case ValueType.INTEGER:
                return new LongGenerator(this._randomLong, min, max);
            case ValueType.DOUBLE:
                return new DoubleGenerator(this._randomDouble, min, max);
            case ValueType.DATE:
                return new DateGenerator(this._randomDate, min, max);
            case ValueType.TIME:
                return new ShortTimeGenerator(this._randomShortTime, min, max);
            case ValueType.LONG_TIME:
                return new TimeGenerator(this._randomTime, min, max);
            case ValueType.DATE_TIME:
                return new ShortDateTimeGenerator(this._randomShortDateTime, min, max);
            case ValueType.LONG_DATE_TIME:
                return new DateTimeGenerator(this._randomDateTime, min, max);
            default:
                throw Error('Generator not available fot the type ' + valueType);
        }
    }
    rawAnalyzer(valueType, min, max) {
        return this.raw(valueType, min, max);
    }
    regex(valueType, expression) {
        return new RegexBasedDataGenerator(this._randomLong, this._randomString, expression, valueType, this._randomTriesToInvalidValues, this._maxPossibleStringLength);
    }
    list(valueType, listValues) {
        return new ListBasedDataGenerator(this._randomLong, this.raw(valueType), listValues, this._randomTriesToInvalidValues);
    }
    invertedLogicList(valueType, listValues) {
        return new InvertedLogicListBasedDataGenerator(this.list(valueType, listValues));
    }
    query(valueType, query, queryable) {
        return new QueryBasedDataGenerator(this._randomLong, this.raw(valueType), queryable, this.queryCache, query, this._randomTriesToInvalidValues);
    }
    invertedLogicQuery(valueType, query, queryable) {
        return new InvertedLogicQueryBasedDataGenerator(this.query(valueType, query, queryable));
    }
    get queryCache() {
        return this._queryCache;
    }
}
