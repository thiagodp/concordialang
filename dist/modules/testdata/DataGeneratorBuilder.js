"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ValueTypeDetector_1 = require("../util/ValueTypeDetector");
const StringGenerator_1 = require("./raw/StringGenerator");
const LongGenerator_1 = require("./raw/LongGenerator");
const DoubleGenerator_1 = require("./raw/DoubleGenerator");
const DateGenerator_1 = require("./raw/DateGenerator");
const TimeGenerator_1 = require("./raw/TimeGenerator");
const DateTimeGenerator_1 = require("./raw/DateTimeGenerator");
const RandomString_1 = require("./random/RandomString");
const Random_1 = require("./random/Random");
const RandomLong_1 = require("./random/RandomLong");
const RandomDouble_1 = require("./random/RandomDouble");
const RandomDate_1 = require("./random/RandomDate");
const RandomTime_1 = require("./random/RandomTime");
const RandomDateTime_1 = require("./random/RandomDateTime");
const RegexBasedDataGenerator_1 = require("./RegexBasedDataGenerator");
const ListBasedDataGenerator_1 = require("./ListBasedDataGenerator");
const QueryBasedDataGenerator_1 = require("./QueryBasedDataGenerator");
const QueryCache_1 = require("../db/QueryCache");
const InvertedLogicListBasedDataGenerator_1 = require("./InvertedLogicListBasedDataGenerator");
const InvertedLogicQueryBasedDataGenerator_1 = require("./InvertedLogicQueryBasedDataGenerator");
/**
 * Data generator builder
 *
 * @author Thiago Delgado Pinto
 */
class DataGeneratorBuilder {
    constructor(_seed, _randomTriesToInvalidValues = 10) {
        this._seed = _seed;
        this._randomTriesToInvalidValues = _randomTriesToInvalidValues;
        this._queryCache = new QueryCache_1.QueryCache();
        this._random = new Random_1.Random(this._seed);
        this._randomString = new RandomString_1.RandomString(this._random);
        this._randomLong = new RandomLong_1.RandomLong(this._random);
        this._randomDouble = new RandomDouble_1.RandomDouble(this._random);
        this._randomDate = new RandomDate_1.RandomDate(this._randomLong);
        this._randomTime = new RandomTime_1.RandomTime(this._randomLong);
        this._randomDateTime = new RandomDateTime_1.RandomDateTime(this._randomLong);
    }
    raw(valueType, min, max) {
        switch (valueType) {
            case ValueTypeDetector_1.ValueType.STRING: return new StringGenerator_1.StringGenerator(this._randomString, min, max);
            case ValueTypeDetector_1.ValueType.INTEGER: return new LongGenerator_1.LongGenerator(this._randomLong, min, max);
            case ValueTypeDetector_1.ValueType.DOUBLE: return new DoubleGenerator_1.DoubleGenerator(this._randomDouble, min, max);
            case ValueTypeDetector_1.ValueType.DATE: return new DateGenerator_1.DateGenerator(this._randomDate, min, max);
            case ValueTypeDetector_1.ValueType.TIME: return new TimeGenerator_1.TimeGenerator(this._randomTime, min, max);
            case ValueTypeDetector_1.ValueType.DATETIME: return new DateTimeGenerator_1.DateTimeGenerator(this._randomDateTime, min, max);
            default: throw Error('Generator not available fot the type ' + valueType);
        }
    }
    rawAnalyzer(valueType, min, max) {
        return this.raw(valueType, min, max);
    }
    regex(valueType, expression) {
        return new RegexBasedDataGenerator_1.RegexBasedDataGenerator(this._randomLong, this._randomString, expression, valueType, this._randomTriesToInvalidValues);
    }
    list(valueType, listValues) {
        return new ListBasedDataGenerator_1.ListBasedDataGenerator(this._randomLong, this.raw(valueType), listValues, this._randomTriesToInvalidValues);
    }
    invertedLogicList(valueType, listValues) {
        return new InvertedLogicListBasedDataGenerator_1.InvertedLogicListBasedDataGenerator(this.list(valueType, listValues));
    }
    query(valueType, query, queriable) {
        return new QueryBasedDataGenerator_1.QueryBasedDataGenerator(this._randomLong, this.raw(valueType), queriable, this.queryCache, query, this._randomTriesToInvalidValues);
    }
    invertedLogicQuery(valueType, query, queriable) {
        return new InvertedLogicQueryBasedDataGenerator_1.InvertedLogicQueryBasedDataGenerator(this.query(valueType, query, queriable));
    }
    get queryCache() {
        return this._queryCache;
    }
}
exports.DataGeneratorBuilder = DataGeneratorBuilder;
//# sourceMappingURL=DataGeneratorBuilder.js.map