import {
    Constant,
    Database,
    DatabaseProperties,
    DatabaseProperty,
    Document,
    EntityValue,
    EntityValueType,
    Node,
    Table,
    UIElement,
    UIProperty,
    UIPropertyTypes,
} from '../ast';
import {
    AlaSqlDatabaseInterface,
    DatabaseJSDatabaseInterface,
    DatabaseToAbstractDatabase,
    QueryParser,
    supportTablesInQueries,
} from '../db';
import { DatabaseInterface, Queryable } from '../dbi';
import { LocatedException, RuntimeException } from '../error';
import { Entities } from '../nlp';
import { AugmentedSpec, IN_MEMORY_DATABASE_NAME } from '../req/AugmentedSpec';
import { NodeTypes } from '../req/NodeTypes';
import { UIETestPlan } from '../testcase/UIETestPlan';
import { QueryReferenceReplacer } from '../util/QueryReferenceReplacer';
import { isDefined, valueOrNull } from '../util/TypeChecking';
import { UIElementNameHandler } from '../util/UIElementNameHandler';
import { UIElementOperatorChecker } from '../util/UIElementOperatorChecker';
import { UIElementPropertyExtractor } from '../util/UIElementPropertyExtractor';
import { adjustValueToTheRightType } from '../util/ValueTypeDetector';
import { DataGenConfig, DataGenerator } from './DataGenerator';
import { DataTestCaseGroup, DataTestCaseGroupDef } from './DataTestCase';

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

export class UIElementValueGenerator {

    private readonly _queryRefReplacer = new QueryReferenceReplacer();

    private readonly _uiePropExtractor = new UIElementPropertyExtractor();
    private readonly _opChecker = new UIElementOperatorChecker();

    private readonly _dbQueryCache = new Map< string, any[] >(); // query => values of the FIRST column only (for all columns, see QueryCache)
    private readonly _tblQueryCache = new Map< string, any[] >(); // query => values of the FIRST column only (for all columns, see QueryCache)


    constructor(
        private readonly _dataGen: DataGenerator
    ) {
    }


    async generate(
        uieName: string,
        context: ValueGenContext,
        doc: Document | null,
        spec: AugmentedSpec,
        errors: LocatedException[]
    ): Promise< EntityValueType > {

        const uieNameHandler = new UIElementNameHandler();
        const featureName = isDefined( doc ) && isDefined( doc.feature ) ? doc.feature.name : null;
        const fullVariableName = featureName !== null && null === uieNameHandler.extractFeatureNameOf( uieName )
            ? uieNameHandler.makeVariableName( featureName, uieName )
            : uieName;

        // Is in cache ? -> returns it
        const cachedValue = valueOrNull( context.uieVariableToValueMap.get( fullVariableName ) );
        if ( isDefined( cachedValue ) ) {
            return cachedValue;
        }

        let uie: UIElement = spec.uiElementByVariable( uieName, doc );
        if ( ! uie ) {
            const msg = 'Could not find UI Element: ' + uieName + '. It was referenced in "' + doc.fileInfo.path + '".';
            const err = new RuntimeException( msg );
            errors.push( err );
            return null;
        }

        const isEditable = this._uiePropExtractor.extractIsEditable( uie );
        if ( ! isEditable ) {
            return null;
        }

        // console.log( '>'.repeat( 10 ), context.uieVariableToPlanMap );
        const plan: UIETestPlan = context.uieVariableToPlanMap.get( fullVariableName );
        if ( ! plan ) {
            const msg = 'Could not find Plan for the UI Element: ' + fullVariableName;
            const err = new RuntimeException( msg );
            errors.push( err );
            return null;
        }

        // console.log( 'plan ->', plan );
        const dtc = plan.dtc;

        // Note: assumes that properties were validated previously, and conflicting properties were already solved.

        const groupDef = new DataTestCaseGroupDef();
        const group = groupDef.groupOf( dtc );
        const propertiesMap = this._uiePropExtractor.mapFirstPropertyOfEachType( uie );
        const msgPropertyValueError = 'Could not resolve the value of the following property: ';

        let cfg = new DataGenConfig();

        // console.log( 'BEFORE cfg >>>>>>>>>>', cfg );
        // console.log( 'properties', propertiesMap.keys() );

        // DATA TYPE

        // cfg.valueType = this._uiePropExtractor.extractDataType( uie ) || ValueType.STRING;

        // v2.0
        cfg.valueType = this._uiePropExtractor.guessDataType( propertiesMap );

        // FORMAT

        const pFormat = propertiesMap.get( UIPropertyTypes.FORMAT ) || null;
        if ( isDefined( pFormat ) ) {
            try {
                cfg.format = ( await this.resolvePropertyValue(
                    UIPropertyTypes.FORMAT, pFormat, pFormat.value, context, doc, spec, errors
                ) ).toString();
            } catch ( e ) {
                const msg = msgPropertyValueError + UIPropertyTypes.FORMAT;
                errors.push( new RuntimeException( msg ) );
            }
        }

        // REQUIRED

        cfg.required = this._uiePropExtractor.extractIsRequired( uie );

        // VALUE

        const pValue = propertiesMap.get( UIPropertyTypes.VALUE ) || null;
        if ( isDefined( pValue ) ) {
            try {
                cfg.value = await this.resolvePropertyValue( UIPropertyTypes.VALUE, pValue, pValue.value, context, doc, spec, errors );
            } catch ( e ) {
                const msg = msgPropertyValueError + UIPropertyTypes.VALUE;
                errors.push( new RuntimeException( msg ) );
            }
        }
        // MIN VALUE / MAX VALUE

        const pMinValue = propertiesMap.get( UIPropertyTypes.MIN_VALUE ) || null;
        if ( isDefined( pMinValue ) ) {
            try {
                cfg.minValue = await this.resolvePropertyValue( UIPropertyTypes.MIN_VALUE, pMinValue, pMinValue.value, context, doc, spec, errors );
            } catch ( e ) {
                const msg = msgPropertyValueError + UIPropertyTypes.MIN_VALUE;
                errors.push( new RuntimeException( msg ) );
            }
        }
        const pMaxValue = propertiesMap.get( UIPropertyTypes.MAX_VALUE ) || null;
        if ( isDefined( pMaxValue ) ) {
            try {
                cfg.maxValue = await this.resolvePropertyValue( UIPropertyTypes.MAX_VALUE, pMaxValue, pMaxValue.value, context, doc, spec, errors );
            } catch ( e ) {
                const msg = msgPropertyValueError + UIPropertyTypes.MAX_VALUE;
                errors.push( new RuntimeException( msg ) );
            }
        }

        // MIN LENGTH / MAX LENGTH

        const pMinLength = propertiesMap.get(  UIPropertyTypes.MIN_LENGTH ) || null;
        if ( isDefined( pMinLength ) ) {
            try {
                cfg.minLength = Number(
                    await this.resolvePropertyValue( UIPropertyTypes.MIN_LENGTH, pMinLength, pMinLength.value, context, doc, spec, errors )
                );
            } catch ( e ) {
                const msg = msgPropertyValueError + UIPropertyTypes.MIN_LENGTH;
                errors.push( new RuntimeException( msg ) );
            }
        }
        const pMaxLength = propertiesMap.get( UIPropertyTypes.MAX_LENGTH ) || null;
        if ( isDefined( pMaxLength ) ) {
            try {
                cfg.maxLength = Number(
                    await this.resolvePropertyValue( UIPropertyTypes.MAX_LENGTH, pMaxLength, pMaxLength.value, context, doc, spec, errors )
                );
            } catch ( e ) {
                const msg = msgPropertyValueError + UIPropertyTypes.MAX_LENGTH;
                errors.push( new RuntimeException( msg ) );
            }
        }

        // // LOCALE
        // const pLocale = propertiesMap.get( UIPropertyTypes.LOCALE ) || null;
        // if ( isDefined( pLocale ) ) {
        //     const locale: string | null = this._uiePropExtractor.extractLocale( uie );
        //     // ...
        // }

        // console.log( '>>>', uieName, cfg, '\nerrors:', errors.map( e => e.message ) );


        // The switch prepares `cfg` to be used after it
        switch ( group ) {

            //
            // format is <number>|<value>|<constant>|<ui_element>
            //
            case DataTestCaseGroup.FORMAT: { // negation is not valid here
                if ( ! pFormat ) {
                    return null;
                }
                break;
            }

            //
            // required is true|false
            //
            case DataTestCaseGroup.REQUIRED: { // negation is not valid here
                break;
            }

            //
            // value is equal to          <number>|<value>|<constant>|<ui_element>
            // value is not equal to      <number>|<value>|<constant>|<ui_element>
            // value in                   <value_list>|<query>
            // value not in               <value_list>|<query>
            //
            case DataTestCaseGroup.SET: { // negation allowed

                if ( ! pValue ) {
                    return null;
                }

                // It has inverted logic if it has the NOT operator
                cfg.invertedLogic = this._opChecker.isNotEqualTo( pValue ) || this._opChecker.isNotIn( pValue );

                break;
            }

            //
            // min/max value is equal to      <number>|<value>|<constant>|<ui_element>
            // min/max value in               <value_list>|<query>
            //
            case DataTestCaseGroup.VALUE: {  // negation is not valid here
                break;
            }

            //
            // min/max length is equal to      <number>|<value>|<constant>|<ui_element>
            // min/max length in               <value_list>|<query>
            //
            case DataTestCaseGroup.LENGTH: {
                break;
            }

            case DataTestCaseGroup.COMPUTATION: { // not supported yet
                return null;
            }

            default: return null;
        }

        // Generate value
        let value;
        try {
            value = await this._dataGen.generate( dtc, cfg );
        } catch ( e ) {
            const msg = 'Error generating value for "' + uieName + '": ' + e.message;
            if ( ! uie.location.filePath ) {
                uie.location.filePath = doc.fileInfo.path;
            }
            errors.push( new RuntimeException( msg, uie.location ) );
        }

        // console.log( '--------------> ', value, 'group:', group );

        // Save in the map
        context.uieVariableToValueMap.set( uie.info.fullVariableName, value );

        return value;
    }


    async resolvePropertyValue(
        propType: UIPropertyTypes,
        owner: UIProperty,
        propertyValue: EntityValue,
        context: ValueGenContext,
        doc: Document,
        spec: AugmentedSpec,
        errors: LocatedException[]
    ): Promise< EntityValueType > {

        if ( ! propertyValue ) {
            return null;
        }

        const featureName = isDefined( doc ) && isDefined( doc.feature ) ? doc.feature.name : null;

        switch ( propertyValue.entity ) {

            // References - Entities CONSTANT and UI_ELEMENT.
            //              The entities STATE and UI_LITERAL are not allowed for UI Properties.

            case Entities.CONSTANT: {
                const constant = propertyValue.references[ 0 ] as Constant;
                if ( isDefined( constant ) ) {
                    return adjustValueToTheRightType( constant.value );
                }
                return null;
            }

            case Entities.UI_ELEMENT_REF: {
                const uie = propertyValue.references[ 0 ] as UIElement;
                if ( isDefined( uie ) && isDefined( uie.info ) && isDefined( uie.info.fullVariableName ) ) {

                    // In cache?
                    let value = valueOrNull( context.uieVariableToValueMap.get( uie.info.fullVariableName ) );

                    // Generate if not in cache
                    if ( ! isDefined( value ) ) {
                        try {
                            value = await this.generate( uie.info.fullVariableName, context, doc, spec, errors );
                        } catch ( e ) {
                            // Error is already consumed by the array errors
                        }
                    }

                    return value;
                }
                return null;
            }

            // Values - Entity QUERY only.
            //          The entities VALUE, NUMBER, and VALUE_LIST were already processed by the UIPropertyRecognizer.

            case Entities.QUERY: {
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

                const databases: Node[] = propertyValue.references.filter( node => node.nodeType === NodeTypes.DATABASE );
                const tables: Node[] = propertyValue.references.filter( node => node.nodeType === NodeTypes.TABLE );

                const hasDatabase: boolean = databases.length > 0;
                const hasTable: boolean = tables.length > 0;
                const hasBoth = hasDatabase && hasTable;

                let msg = null;
                if ( hasBoth ) {
                    msg = 'Query cannot have a reference to a Database and a reference to a Table.';
                } else if ( hasDatabase ) {
                    if ( databases.length > 1 ) {
                        msg = 'Query cannot have more than one Database reference.';
                    } else {
                        let query = propertyValue.value.toString();
                        try {
                            query = this.resolveConstantsInQuery( query, propertyValue.references );
                            query = await this.resolveUIElementsInQuery( query, featureName, owner, context, doc, spec, errors );
                            return await this.resolveDatabaseReferenceInQuery( propType, query, databases[ 0 ] as Database, spec, errors );
                        } catch ( e ) {
                            const msg = doc.fileInfo.path + ': Error trying to process a database query. ' + e.message;
                            return null;
                        }
                    }
                } else if ( hasTable ) {
                    if ( tables.length > 1 ) {
                        msg = 'Query cannot have more than one Table reference.';
                    } else {
                        let query = propertyValue.value.toString();
                        try {
                            query = this.resolveConstantsInQuery( query, propertyValue.references );
                            query = await this.resolveUIElementsInQuery( query, featureName, owner, context, doc, spec, errors );
                            return await this.resolveTableReferenceInQuery( propType, query, tables[ 0 ] as Table, spec, errors );
                        } catch ( e ) {
                            const msg = doc.fileInfo.path + ': Error trying to process a database query. ' + e.message;
                            return null;
                        }
                    }
				}

                if ( isDefined( msg ) ) {
                    const err = new RuntimeException( msg, owner.location );
                    // Errors may have duplicated messages. Comparisons should
                    // be made after creating the error, since the exception
                    // could change it (like LocationException does).
                    if ( ! errors.find( e => e.message === err.message ) ) {
                        errors.push( err );
                    }
                    return null;
                }

                return propertyValue.value;
            }

            default: {
                return propertyValue.value;
            }
        }
    }


    resolveConstantsInQuery(
        query: string,
        nodes: Node[]
    ): string {
        const constants: Constant[] = nodes
            .filter( node => node.nodeType === NodeTypes.CONSTANT )
            .map( node => node as Constant );
        let newQuery = query;
        for ( let c of constants ) {
            newQuery = this._queryRefReplacer.replaceConstantInQuery( newQuery, c.name, adjustValueToTheRightType( c.value ) );
        }
        return newQuery;
    }

    async resolveUIElementsInQuery(
        query: string,
        currentFeatureName: string | null,
        owner: UIProperty,
        context: ValueGenContext,
        doc: Document,
        spec: AugmentedSpec,
        errors: LocatedException[]
    ): Promise< string > {

        const variables: string[] = ( new QueryParser() ).parseAnyVariables( query );
        if ( variables.length < 1 ) { // No variables
            return query;
        }

        // const featureName = isDefined( currentFeatureName )
        //     ? currentFeatureName
        //     : '';

        const uieNameHandler = new UIElementNameHandler();

        let newQuery = query;
        for ( let variable of variables ) {
            // console.log( 'variable', variable );
            let fullVariableName = variable;
            if ( null === uieNameHandler.extractFeatureNameOf( variable ) ) {
                let uie = spec.uiElementByVariable( variable, doc );
                // console.log( 'uie', ! uie ? 'null' : uie.name );
                if ( ! uie ) {
                    fullVariableName = uieNameHandler.makeVariableName( currentFeatureName, variable );
                } else {
                    fullVariableName = uie.info.fullVariableName;
                }
            }
            // console.log( '>'.repeat( 10 ), fullVariableName );

            let value = valueOrNull( context.uieVariableToValueMap.get( fullVariableName ) );
            // console.log( 'Value from cache', isDefined( value ) ? value : 'null' );
            if ( null === value ) {
                try {
                    value = await this.generate( fullVariableName, context, doc, spec, errors );
                    // console.log( 'Generated value', isDefined( value ) ? value : 'null' );
                } catch ( e ) {
                    // errors.push( e );
                    // Ignored because errors already consumes the error
                }
            }

            newQuery = this._queryRefReplacer.replaceUIElementInQuery(
                newQuery,
                variable,
                Array.isArray( value ) ? value[ 0 ] : value
            );

            // console.log( 'newQuery', newQuery );
        }
        return newQuery;
    }

    async resolveDatabaseReferenceInQuery(
        propType: UIPropertyTypes,
        query: string,
        database: Database,
        spec: AugmentedSpec,
        errors: LocatedException[]
    ): Promise< EntityValueType > {

        const absDB = ( new DatabaseToAbstractDatabase() ).convertFromNode( database );
        const supportTables = supportTablesInQueries( absDB.driverName );

        // console.log( 'before', query );
        // Remove database reference from the query
        const newQuery = this._queryRefReplacer.replaceDatabaseInQuery( query, database.name, ! supportTables );
        // console.log( 'after', newQuery );

        if ( this._dbQueryCache.has( newQuery ) ) {
            // console.log( 'query', newQuery, 'dbQueryCache', this._dbQueryCache.get( newQuery ) );
            return this.properDataFor( propType, this._dbQueryCache.get( newQuery ) );
        }

        // Retrieve database interface
        let intf: DatabaseInterface = spec.databaseNameToInterfaceMap().get( database.name );

        // Create the connection interface if not available
        if ( ! intf ) {
            intf = new DatabaseJSDatabaseInterface();
            try {
                await intf.connect( database, spec.basePath );
            } catch ( err ) {
                errors.push( err );
                return null;
            }
            spec.databaseNameToInterfaceMap().set( database.name, intf );
        }

        let returnedData;
        try {
            returnedData = await this.queryResult( newQuery, intf, errors );
        } catch ( err ) {
            errors.push( err );
            return null;
        }
        // console.log( 'returnedData', returnedData );
        const firstColumnData = this.firstColumnOf( returnedData );
        if ( isDefined( firstColumnData ) ) {
            this._dbQueryCache.set( newQuery, firstColumnData );
        }
        return this.properDataFor( propType, firstColumnData );
    }


    async resolveTableReferenceInQuery(
        propType: UIPropertyTypes,
        query: string,
        table: Table,
        spec: AugmentedSpec,
        errors: LocatedException[]
    ): Promise< EntityValueType > {

        // console.log( 'before', query );
        // Replace table reference with its internal name
        const newQuery = this._queryRefReplacer.replaceTableInQuery( query, table.name, table.internalName );

        if ( this._tblQueryCache.has( newQuery ) ) {
            return this.properDataFor( propType, this._tblQueryCache.get( newQuery ) );
        }
        // console.log( 'after', newQuery );

        // Retrieve database interface
        let intf = spec.databaseNameToInterfaceMap().get( IN_MEMORY_DATABASE_NAME );

        // Create the table interface if not available
        if ( ! intf ) {

            const database: Database = < Database > {
                name: IN_MEMORY_DATABASE_NAME,
                nodeType: NodeTypes.DATABASE,
                location: { column: 1, line: 1 },
                items: [
                    {
                        nodeType: NodeTypes.DATABASE_PROPERTY,
                        location: { column: 1, line: 2 },
                        property: DatabaseProperties.TYPE,
                        value: 'alasql',
                        content: 'type is alasql'
                    } as DatabaseProperty
                ]
            };

            intf = new AlaSqlDatabaseInterface();
            try {
                await intf.connect( database, spec.basePath );
            } catch ( err ) {
                errors.push( err );
                return null;
            }
            spec.databaseNameToInterfaceMap().set( IN_MEMORY_DATABASE_NAME, intf );
        }

        try {
            await intf.createTable( table );
        } catch ( err ) {
            errors.push( err );
            return null;
        }

        // console.log( 'INTF', intf );

        let returnedData;
        try {
            returnedData = await this.queryResult( newQuery, intf, errors );
        } catch ( err ) {
            errors.push( err );
            return null;
        }
        const firstColumnData = this.firstColumnOf( returnedData );
        if ( isDefined( firstColumnData ) ) {
            this._tblQueryCache.set( newQuery, firstColumnData );
        }
        return this.properDataFor( propType, firstColumnData );
    }


    async queryResult( query: string, intf: Queryable, errors: LocatedException[] ): Promise< any > {
        try {
            return await intf.query( query );
        } catch ( err ) {
            errors.push( err );
            return null;
        }
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

    firstColumnOf( data: any[] ): any[] {
        let values: any[] = [];
        // console.log( data );
        for ( let obj of data || [] ) {
            for ( let column in obj || {} ) {
                values.push( obj[ column ] );
                break; // first column only !
            }
        }
        return values;
    }


    properDataFor( propType: UIPropertyTypes, data: any[] ): any {
        if ( UIPropertyTypes.VALUE === propType ) {
            return data;
        }
        return ! data ? null : data[ 0 ] || null;
    }

}


export class ValueGenContext {

    /**
     *
     * @param uieVariableToPlanMap Maps a UI Element Variable to a UIETestPlan
     * @param uieVariableToValueMap Maps a UI Element Variable to a value
     */
    constructor(
        public uieVariableToPlanMap = new Map< string, UIETestPlan >(),
        public uieVariableToValueMap = new Map< string, EntityValueType >()
    ) {
    }

}
