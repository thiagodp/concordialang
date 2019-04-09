"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nlp_1 = require("concordialang-types/nlp");
const DatabaseToAbstractDatabase_1 = require("../db/DatabaseToAbstractDatabase");
const DatabaseTypes_1 = require("../db/DatabaseTypes");
const DatabaseWrapper_1 = require("../db/DatabaseWrapper");
const InMemoryTableWrapper_1 = require("../db/InMemoryTableWrapper");
const QueryParser_1 = require("../db/QueryParser");
const NodeTypes_1 = require("../req/NodeTypes");
const RuntimeException_1 = require("../req/RuntimeException");
const QueryReferenceReplacer_1 = require("../util/QueryReferenceReplacer");
const TypeChecking_1 = require("../util/TypeChecking");
const UIElementNameHandler_1 = require("../util/UIElementNameHandler");
const UIElementOperatorChecker_1 = require("../util/UIElementOperatorChecker");
const UIElementPropertyExtractor_1 = require("../util/UIElementPropertyExtractor");
const UIPropertyTypes_1 = require("../util/UIPropertyTypes");
const ValueTypeDetector_1 = require("../util/ValueTypeDetector");
const DataGenerator_1 = require("./DataGenerator");
const DataTestCase_1 = require("./DataTestCase");
// value is equal to          <number>|<value>|<constant>|<ui_element>
// value is not equal to      <number>|<value>|<constant>|<ui_element>
// value in                   <value_list>|<query>
// value not in               <value_list>|<query>
//
// min value is equal to      <number>|<value>|<constant>|<ui_element>
// min value in               <value_list>|<query>
//
// format is equal to         <number>|<value>|<constant>|<ui_element>  <-- negation is not valid for format
//
// required is true|false                                               <-- negation is not valid for required
class UIElementValueGenerator {
    constructor(_dataGen) {
        this._dataGen = _dataGen;
        this._queryRefReplacer = new QueryReferenceReplacer_1.QueryReferenceReplacer();
        this._uiePropExtractor = new UIElementPropertyExtractor_1.UIElementPropertyExtractor();
        this._opChecker = new UIElementOperatorChecker_1.UIElementOperatorChecker();
        this._dbQueryCache = new Map(); // query => values of the FIRST column only (for all columns, see QueryCache)
        this._tblQueryCache = new Map(); // query => values of the FIRST column only (for all columns, see QueryCache)
    }
    generate(uieName, context, doc, spec, errors) {
        return __awaiter(this, void 0, void 0, function* () {
            const uieNameHandler = new UIElementNameHandler_1.UIElementNameHandler();
            const featureName = TypeChecking_1.isDefined(doc) && TypeChecking_1.isDefined(doc.feature) ? doc.feature.name : null;
            const fullVariableName = featureName !== null && null === uieNameHandler.extractFeatureNameOf(uieName)
                ? uieNameHandler.makeVariableName(featureName, uieName)
                : uieName;
            // Is in cache ? -> returns it
            const cachedValue = TypeChecking_1.valueOrNull(context.uieVariableToValueMap.get(fullVariableName));
            if (TypeChecking_1.isDefined(cachedValue)) {
                return cachedValue;
            }
            let uie = spec.uiElementByVariable(uieName, doc);
            if (!uie) {
                const msg = 'Could not find UI Element: ' + uieName + '. It was referenced in "' + doc.fileInfo.path + '".';
                const err = new RuntimeException_1.RuntimeException(msg);
                errors.push(err);
                return null;
            }
            const isEditable = this._uiePropExtractor.extractIsEditable(uie);
            if (!isEditable) {
                return null;
            }
            // console.log( '>'.repeat( 10 ), context.uieVariableToPlanMap );
            const plan = context.uieVariableToPlanMap.get(fullVariableName);
            if (!plan) {
                const msg = 'Could not find Plan for the UI Element: ' + fullVariableName;
                const err = new RuntimeException_1.RuntimeException(msg);
                errors.push(err);
                return null;
            }
            // console.log( 'plan ->', plan );
            const dtc = plan.dtc;
            // Note: assumes that properties were validated previously, and conflicting properties were already solved.
            const groupDef = new DataTestCase_1.DataTestCaseGroupDef();
            const group = groupDef.groupOf(dtc);
            const propertiesMap = this._uiePropExtractor.mapFirstProperty(uie);
            const msgPropertyValueError = 'Could not resolve the value of the following property: ';
            let cfg = new DataGenerator_1.DataGenConfig();
            // console.log( 'BEFORE cfg >>>>>>>>>>', cfg );
            // console.log( 'properties', propertiesMap.keys() );
            // DATA TYPE
            cfg.valueType = this._uiePropExtractor.extractDataType(uie) || ValueTypeDetector_1.ValueType.STRING;
            // FORMAT
            const pFormat = propertiesMap.get(UIPropertyTypes_1.UIPropertyTypes.FORMAT) || null;
            if (TypeChecking_1.isDefined(pFormat)) {
                try {
                    cfg.format = (yield this.resolvePropertyValue(UIPropertyTypes_1.UIPropertyTypes.FORMAT, pFormat, pFormat.value, context, doc, spec, errors)).toString();
                }
                catch (e) {
                    const msg = msgPropertyValueError + UIPropertyTypes_1.UIPropertyTypes.FORMAT;
                    errors.push(new RuntimeException_1.RuntimeException(msg));
                }
            }
            // REQUIRED
            cfg.required = this._uiePropExtractor.extractIsRequired(uie);
            // VALUE
            const pValue = propertiesMap.get(UIPropertyTypes_1.UIPropertyTypes.VALUE) || null;
            if (TypeChecking_1.isDefined(pValue)) {
                try {
                    cfg.value = yield this.resolvePropertyValue(UIPropertyTypes_1.UIPropertyTypes.VALUE, pValue, pValue.value, context, doc, spec, errors);
                }
                catch (e) {
                    const msg = msgPropertyValueError + UIPropertyTypes_1.UIPropertyTypes.VALUE;
                    errors.push(new RuntimeException_1.RuntimeException(msg));
                }
            }
            // MIN VALUE / MAX VALUE
            const pMinValue = propertiesMap.get(UIPropertyTypes_1.UIPropertyTypes.MIN_VALUE) || null;
            if (TypeChecking_1.isDefined(pMinValue)) {
                try {
                    cfg.minValue = yield this.resolvePropertyValue(UIPropertyTypes_1.UIPropertyTypes.MIN_VALUE, pMinValue, pMinValue.value, context, doc, spec, errors);
                }
                catch (e) {
                    const msg = msgPropertyValueError + UIPropertyTypes_1.UIPropertyTypes.MIN_VALUE;
                    errors.push(new RuntimeException_1.RuntimeException(msg));
                }
            }
            const pMaxValue = propertiesMap.get(UIPropertyTypes_1.UIPropertyTypes.MAX_VALUE) || null;
            if (TypeChecking_1.isDefined(pMaxValue)) {
                try {
                    cfg.maxValue = yield this.resolvePropertyValue(UIPropertyTypes_1.UIPropertyTypes.MAX_VALUE, pMaxValue, pMaxValue.value, context, doc, spec, errors);
                }
                catch (e) {
                    const msg = msgPropertyValueError + UIPropertyTypes_1.UIPropertyTypes.MAX_VALUE;
                    errors.push(new RuntimeException_1.RuntimeException(msg));
                }
            }
            // MIN LENGTH / MAX LENGTH
            const pMinLength = propertiesMap.get(UIPropertyTypes_1.UIPropertyTypes.MIN_LENGTH) || null;
            if (TypeChecking_1.isDefined(pMinLength)) {
                try {
                    cfg.minLength = Number(yield this.resolvePropertyValue(UIPropertyTypes_1.UIPropertyTypes.MIN_LENGTH, pMinLength, pMinLength.value, context, doc, spec, errors));
                }
                catch (e) {
                    const msg = msgPropertyValueError + UIPropertyTypes_1.UIPropertyTypes.MIN_LENGTH;
                    errors.push(new RuntimeException_1.RuntimeException(msg));
                }
            }
            const pMaxLength = propertiesMap.get(UIPropertyTypes_1.UIPropertyTypes.MAX_LENGTH) || null;
            if (TypeChecking_1.isDefined(pMaxLength)) {
                try {
                    cfg.maxLength = Number(yield this.resolvePropertyValue(UIPropertyTypes_1.UIPropertyTypes.MAX_LENGTH, pMaxLength, pMaxLength.value, context, doc, spec, errors));
                }
                catch (e) {
                    const msg = msgPropertyValueError + UIPropertyTypes_1.UIPropertyTypes.MAX_LENGTH;
                    errors.push(new RuntimeException_1.RuntimeException(msg));
                }
            }
            // console.log( 'cfg >>>>>>>>>>', cfg, '\nerrors:', errors.map( e => e.message ) );
            // The switch prepares `cfg` to be used after it
            switch (group) {
                //
                // format is <number>|<value>|<constant>|<ui_element>
                //
                case DataTestCase_1.DataTestCaseGroup.FORMAT: { // negation is not valid here
                    if (!pFormat) {
                        return null;
                    }
                    break;
                }
                //
                // required is true|false
                //
                case DataTestCase_1.DataTestCaseGroup.REQUIRED: { // negation is not valid here
                    break;
                }
                //
                // value is equal to          <number>|<value>|<constant>|<ui_element>
                // value is not equal to      <number>|<value>|<constant>|<ui_element>
                // value in                   <value_list>|<query>
                // value not in               <value_list>|<query>
                //
                case DataTestCase_1.DataTestCaseGroup.SET: { // negation allowed
                    if (!pValue) {
                        return null;
                    }
                    // It has inverted logic if it has the NOT operator
                    cfg.invertedLogic = this._opChecker.isNotEqualTo(pValue) || this._opChecker.isNotIn(pValue);
                    break;
                }
                //
                // min/max value is equal to      <number>|<value>|<constant>|<ui_element>
                // min/max value in               <value_list>|<query>
                //
                case DataTestCase_1.DataTestCaseGroup.VALUE: { // negation is not valid here
                    break;
                }
                //
                // min/max length is equal to      <number>|<value>|<constant>|<ui_element>
                // min/max length in               <value_list>|<query>
                //
                case DataTestCase_1.DataTestCaseGroup.LENGTH: {
                    break;
                }
                case DataTestCase_1.DataTestCaseGroup.COMPUTATION: { // not supported yet
                    return null;
                }
                default: return null;
            }
            // Generate value
            let value;
            try {
                value = yield this._dataGen.generate(dtc, cfg);
            }
            catch (e) {
                const msg = 'Error generating value for "' + uieName + '": ' + e.message;
                if (!uie.location.filePath) {
                    uie.location.filePath = doc.fileInfo.path;
                }
                errors.push(new RuntimeException_1.RuntimeException(msg, uie.location));
            }
            // console.log( '--------------> ', value );
            // Save in the map
            context.uieVariableToValueMap.set(uie.info.fullVariableName, value);
            return value;
        });
    }
    resolvePropertyValue(propType, owner, propertyValue, context, doc, spec, errors) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!propertyValue) {
                return null;
            }
            const featureName = TypeChecking_1.isDefined(doc) && TypeChecking_1.isDefined(doc.feature) ? doc.feature.name : null;
            switch (propertyValue.entity) {
                // References - Entities CONSTANT and UI_ELEMENT.
                //              The entities STATE and UI_LITERAL are not allowed for UI Properties.
                case nlp_1.Entities.CONSTANT: {
                    const constant = propertyValue.references[0];
                    if (TypeChecking_1.isDefined(constant)) {
                        return ValueTypeDetector_1.adjustValueToTheRightType(constant.value);
                    }
                    return null;
                }
                case nlp_1.Entities.UI_ELEMENT: {
                    const uie = propertyValue.references[0];
                    if (TypeChecking_1.isDefined(uie) && TypeChecking_1.isDefined(uie.info) && TypeChecking_1.isDefined(uie.info.fullVariableName)) {
                        // In cache?
                        let value = TypeChecking_1.valueOrNull(context.uieVariableToValueMap.get(uie.info.fullVariableName));
                        // Generate if not in cache
                        if (!TypeChecking_1.isDefined(value)) {
                            try {
                                value = yield this.generate(uie.info.fullVariableName, context, doc, spec, errors);
                            }
                            catch (e) {
                                // Error is already consumed by the array errors
                            }
                        }
                        return value;
                    }
                    return null;
                }
                // Values - Entity QUERY only.
                //          The entities VALUE, NUMBER, and VALUE_LIST were already processed by the UIPropertyRecognizer.
                case nlp_1.Entities.QUERY: {
                    //
                    // Resolve query's references to execute it.
                    //
                    // There are two types of query:
                    //   1. A query that has a Database reference;
                    //   2. A query that has a Table reference.
                    //
                    // In both types, Constants and UI Elements are replaced by their values.
                    // However, the process performed to execute the query is different:
                    //
                    //   1. The Database name is removed, then a connection is established
                    //      and the query is executed.
                    //
                    //   2. The Table name is used to create a in-memory virtual
                    //      table, over which the query is executed.
                    //
                    // Notes:
                    //   - A query without a reference to a Database or a Table
                    //     is not considered valid.
                    //   - More than one Database entity in the same query is not supported.
                    //   - More than one Table entity in the same query is not supported.
                    //
                    const databases = propertyValue.references.filter(node => node.nodeType === NodeTypes_1.NodeTypes.DATABASE);
                    const tables = propertyValue.references.filter(node => node.nodeType === NodeTypes_1.NodeTypes.TABLE);
                    const hasDatabase = databases.length > 0;
                    const hasTable = tables.length > 0;
                    const hasBoth = hasDatabase && hasTable;
                    let msg = null;
                    if (hasBoth) {
                        msg = 'Query cannot have a reference to a Database and a reference to a Table.';
                    }
                    else if (hasDatabase) {
                        if (databases.length > 1) {
                            msg = 'Query cannot have more than one Database reference.';
                        }
                        else {
                            let query = propertyValue.value.toString();
                            try {
                                query = this.resolveConstantsInQuery(query, propertyValue.references);
                                query = yield this.resolveUIElementsInQuery(query, featureName, owner, context, doc, spec, errors);
                                return yield this.resolveDatabaseReferenceInQuery(propType, query, databases[0], spec, errors);
                            }
                            catch (e) {
                                const msg = doc.fileInfo.path + ': Error trying to process a database query. ' + e.message;
                                return null;
                            }
                        }
                    }
                    else if (hasTable) {
                        if (tables.length > 1) {
                            msg = 'Query cannot have more than one Table reference.';
                        }
                        else {
                            let query = propertyValue.value.toString();
                            try {
                                query = this.resolveConstantsInQuery(query, propertyValue.references);
                                query = yield this.resolveUIElementsInQuery(query, featureName, owner, context, doc, spec, errors);
                                return yield this.resolveTableReferenceInQuery(propType, query, tables[0], spec, errors);
                            }
                            catch (e) {
                                const msg = doc.fileInfo.path + ': Error trying to process a database query. ' + e.message;
                                return null;
                            }
                        }
                    }
                    else { // none
                        msg = 'Query must have a Database reference or a Table reference.';
                    }
                    if (TypeChecking_1.isDefined(msg)) {
                        const err = new RuntimeException_1.RuntimeException(msg, owner.location);
                        errors.push(err);
                        return null;
                    }
                }
                default: {
                    return propertyValue.value;
                }
            }
        });
    }
    resolveConstantsInQuery(query, nodes) {
        const constants = nodes
            .filter(node => node.nodeType === NodeTypes_1.NodeTypes.CONSTANT)
            .map(node => node);
        let newQuery = query;
        for (let c of constants) {
            newQuery = this._queryRefReplacer.replaceConstantInQuery(newQuery, c.name, ValueTypeDetector_1.adjustValueToTheRightType(c.value));
        }
        return newQuery;
    }
    resolveUIElementsInQuery(query, currentFeatureName, owner, context, doc, spec, errors) {
        return __awaiter(this, void 0, void 0, function* () {
            const variables = (new QueryParser_1.QueryParser()).parseAnyVariables(query);
            if (variables.length < 1) { // No variables
                return query;
            }
            const featureName = TypeChecking_1.isDefined(currentFeatureName)
                ? currentFeatureName
                : '';
            const uieNameHandler = new UIElementNameHandler_1.UIElementNameHandler();
            let newQuery = query;
            for (let variable of variables) {
                // console.log( 'variable', variable );
                let fullVariableName = variable;
                if (null === uieNameHandler.extractFeatureNameOf(variable)) {
                    let uie = spec.uiElementByVariable(variable, doc);
                    // console.log( 'uie', ! uie ? 'null' : uie.name );
                    if (!uie) {
                        fullVariableName = uieNameHandler.makeVariableName(currentFeatureName, variable);
                    }
                    else {
                        fullVariableName = uie.info.fullVariableName;
                    }
                }
                // console.log( '>'.repeat( 10 ), fullVariableName );
                let value = TypeChecking_1.valueOrNull(context.uieVariableToValueMap.get(fullVariableName));
                // console.log( 'Value from cache', isDefined( value ) ? value : 'null' );
                if (null === value) {
                    try {
                        value = yield this.generate(fullVariableName, context, doc, spec, errors);
                        // console.log( 'Generated value', isDefined( value ) ? value : 'null' );
                    }
                    catch (e) {
                        // errors.push( e );
                        // Ignored because errors already consumes the error
                    }
                }
                newQuery = this._queryRefReplacer.replaceUIElementInQuery(newQuery, variable, Array.isArray(value) ? value[0] : value);
                // console.log( 'newQuery', newQuery );
            }
            return newQuery;
        });
    }
    resolveDatabaseReferenceInQuery(propType, query, database, spec, errors) {
        return __awaiter(this, void 0, void 0, function* () {
            const absDB = (new DatabaseToAbstractDatabase_1.DatabaseToAbstractDatabase()).convertFromNode(database);
            const supportTables = DatabaseTypes_1.supportTablesInQueries(absDB.driverName);
            // console.log( 'before', query );
            // Remove database reference from the query
            const newQuery = this._queryRefReplacer.replaceDatabaseInQuery(query, database.name, !supportTables);
            // console.log( 'after', newQuery );
            if (this._dbQueryCache.has(newQuery)) {
                // console.log( 'query', newQuery, 'dbQueryCache', this._dbQueryCache.get( newQuery ) );
                return this.properDataFor(propType, this._dbQueryCache.get(newQuery));
            }
            // Retrieve connection interface
            let intf = spec.databaseNameToInterfaceMap().get(database.name);
            // Create the connection interface if not available
            if (!intf) {
                intf = new DatabaseWrapper_1.DatabaseWrapper();
                try {
                    yield intf.connect(database, spec.basePath);
                }
                catch (err) {
                    errors.push(err);
                    return null;
                }
                spec.databaseNameToInterfaceMap().set(database.name, intf);
            }
            let returnedData;
            try {
                returnedData = yield this.queryResult(newQuery, intf, errors);
            }
            catch (err) {
                errors.push(err);
                return null;
            }
            // console.log( 'returnedData', returnedData );
            const firstColumnData = this.firstColumnOf(returnedData);
            if (TypeChecking_1.isDefined(firstColumnData)) {
                this._dbQueryCache.set(newQuery, firstColumnData);
            }
            return this.properDataFor(propType, firstColumnData);
        });
    }
    resolveTableReferenceInQuery(propType, query, table, spec, errors) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log( 'before', query );
            // Replace table reference with its internal name
            const newQuery = this._queryRefReplacer.replaceTableInQuery(query, table.name, table.internalName);
            if (this._tblQueryCache.has(newQuery)) {
                return this.properDataFor(propType, this._tblQueryCache.get(newQuery));
            }
            // console.log( 'after', newQuery );
            // Retrieve table interface
            let intf = spec.tableNameToInterfaceMap().get(table.name);
            // Create the table interface if not available
            if (!intf) {
                intf = new InMemoryTableWrapper_1.InMemoryTableWrapper();
                try {
                    yield intf.connect(table);
                }
                catch (err) {
                    errors.push(err);
                    return null;
                }
                spec.tableNameToInterfaceMap().set(table.name, intf);
            }
            let returnedData;
            try {
                returnedData = yield this.queryResult(newQuery, intf, errors);
            }
            catch (err) {
                errors.push(err);
                return null;
            }
            const firstColumnData = this.firstColumnOf(returnedData);
            if (TypeChecking_1.isDefined(firstColumnData)) {
                this._tblQueryCache.set(newQuery, firstColumnData);
            }
            return this.properDataFor(propType, firstColumnData);
        });
    }
    queryResult(query, intf, errors) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield intf.query(query);
            }
            catch (err) {
                errors.push(err);
                return null;
            }
        });
    }
    // dataFor( propType: UIPropertyTypes, data: any[] ): any {
    //     switch ( propType ) {
    //         case UIPropertyTypes.VALUE: return this.firstColumnOf( data );
    //         default: return this.firstCellOf( data );
    //     }
    // }
    // firstCellOf( data: any[] ): any {
    //     if ( ! data || data.length < 1 ) {
    //         return null;
    //     }
    //     const firstRow = data[ 0 ];
    //     for ( let key in firstRow ) {
    //         return firstRow[ key ];
    //     }
    //     return null;
    // }
    // firstColumnOf( data: any[] ): any[] | null {
    //     if ( ! data ) {
    //         return null;
    //     }
    //     const rowCount = data.length;
    //     if ( rowCount < 1 ) {
    //         return null;
    //     }
    //     let values: any[] = [], row;
    //     for ( let i = 0; i < rowCount; ++i ) {
    //         row = data[ i ];
    //         for ( let key in row ) {
    //             values.push( row[ key ] );
    //             break;
    //         }
    //     }
    //     return values;
    // }
    firstColumnOf(data) {
        let values = [];
        // console.log( data );
        for (let obj of data || []) {
            for (let column in obj || {}) {
                values.push(obj[column]);
                break; // first column only !
            }
        }
        return values;
    }
    properDataFor(propType, data) {
        if (UIPropertyTypes_1.UIPropertyTypes.VALUE === propType) {
            return data;
        }
        return !data ? null : data[0] || null;
    }
}
exports.UIElementValueGenerator = UIElementValueGenerator;
class ValueGenContext {
    /**
     *
     * @param uieVariableToPlanMap Maps a UI Element Variable to a UIETestPlan
     * @param uieVariableToValueMap Maps a UI Element Variable to a value
     */
    constructor(uieVariableToPlanMap = new Map(), uieVariableToValueMap = new Map()) {
        this.uieVariableToPlanMap = uieVariableToPlanMap;
        this.uieVariableToValueMap = uieVariableToValueMap;
    }
}
exports.ValueGenContext = ValueGenContext;
