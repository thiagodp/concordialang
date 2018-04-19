import { EntityValueType,  UIElement, UIProperty, EntityValue } from '../ast/UIElement';
import { UIElementPropertyExtractor } from "../util/UIElementPropertyExtractor";
import { DataGenConfig, DataGenerator } from './DataGenerator';
import { UIPropertyTypes } from '../util/UIPropertyTypes';
import { UIElementOperatorChecker } from '../util/UIElementOperatorChecker';
import { DataGeneratorBuilder } from './DataGeneratorBuilder';
import { Entities } from '../nlp/Entities';
import { NLPUtil } from '../nlp/NLPResult';
import { Spec } from '../ast/Spec';
import { RuntimeException } from '../req/RuntimeException';
import { LocatedException } from '../req/LocatedException';
import { Document } from '../ast/Document';
import { isDefined } from '../util/TypeChecking';
import { DataTestCase, DataTestCaseGroupDef, DataTestCaseGroup } from './DataTestCase';
import { NodeTypes } from '../req/NodeTypes';
import { Node } from '../ast/Node';
import { Database } from '../ast/Database';
import { Table } from '../ast/Table';
import { QueryReferenceReplacer } from '../util/QueryReferenceReplacer';
import { adjustValueToTheRightType } from '../util/ValueTypeDetector';
import { Constant } from '../ast/Constant';
import { Symbols } from '../req/Symbols';
import { QueryParser } from '../db/QueryParser';
import { DatabaseWrapper } from '../db/DatabaseWrapper';
import { InMemoryTableWrapper } from '../db/InMemoryTableWrapper';
import { Queryable } from '../req/Queryable';
import { UIETestPlan } from '../testcase/UIETestPlan';
import { UIElementNameHandler } from '../util/UIElementNameHandler';

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
    private readonly _dataGen: DataGenerator;

    private readonly _dbQueryCache = new Map< string, any[] >(); // query => values of the FIRST column only (for all columns, see QueryCache)
    private readonly _tblQueryCache = new Map< string, any[] >(); // query => values of the FIRST column only (for all columns, see QueryCache)


    constructor(
        seed: string,
        randomTriesToInvalidValues: number = 10
    ) {
        this._dataGen = new DataGenerator( new DataGeneratorBuilder( seed, randomTriesToInvalidValues ) );
    }


    async generate(
        uieName: string,
        context: ValueGenContext,
        doc: Document | null,
        spec: Spec,
        errors: LocatedException[]
    ): Promise< EntityValueType > {

        const uieNameHandler = new UIElementNameHandler();
        const featureName = isDefined( doc ) && isDefined( doc.feature ) ? doc.feature.name : null;
        const fullVariableName = featureName !== null && null === uieNameHandler.extractFeatureNameOf( uieName )
            ? uieNameHandler.makeVariableName( featureName, uieName )
            : uieName;

        // Is in cache ? -> returns it
        const cachedValue = context.uieVariableToValueMap.get( fullVariableName ) || null;
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
        const propertiesMap = this._uiePropExtractor.mapFirstProperty( uie );

        let cfg = new DataGenConfig();

        // The switch prepares `cfg` to be used after it
        switch ( group ) {

            //
            // format is <number>|<value>|<constant>|<ui_element>
            //
            case DataTestCaseGroup.FORMAT: { // negation is not valid here

                const pFormat = propertiesMap.get( UIPropertyTypes.FORMAT ) || null;
                if ( ! pFormat ) {
                    return null;
                }

                cfg.format = ( await this.resolvePropertyValue( UIPropertyTypes.FORMAT, pFormat, pFormat.value, context, doc, spec, errors ) )
                    .toString();

                break;
            }

            //
            // required is true|false
            //
            case DataTestCaseGroup.REQUIRED: { // negation is not valid here

                cfg.required = this._uiePropExtractor.extractIsRequired( uie );

                break;
            }

            //
            // value is equal to          <number>|<value>|<constant>|<ui_element>
            // value is not equal to      <number>|<value>|<constant>|<ui_element>
            // value in                   <value_list>|<query>
            // value not in               <value_list>|<query>
            //
            case DataTestCaseGroup.SET: { // negation allowed

                const pValue = propertiesMap.get( UIPropertyTypes.VALUE ) || null;
                if ( ! pValue ) {
                    return null;
                }

                // It has inverted logic if it has the NOT operator
                cfg.invertedLogic = this._opChecker.isNotEqualTo( pValue ) || this._opChecker.isNotIn( pValue );
                cfg.value = await this.resolvePropertyValue( UIPropertyTypes.VALUE, pValue, pValue.value, context, doc, spec, errors );
                break;
            }

            //
            // min/max value is equal to      <number>|<value>|<constant>|<ui_element>
            // min/max value in               <value_list>|<query>
            //
            case DataTestCaseGroup.VALUE: {  // negation is not valid here

                const pMinValue = propertiesMap.get( UIPropertyTypes.MIN_VALUE ) || null;
                const pMaxValue = propertiesMap.get( UIPropertyTypes.MAX_VALUE ) || null;

                if ( isDefined( pMinValue ) ) {
                    cfg.minValue = await this.resolvePropertyValue( UIPropertyTypes.MIN_VALUE, pMinValue, pMinValue.value, context, doc, spec, errors );
                }

                if ( isDefined( pMaxValue ) ) {
                    cfg.maxValue = await this.resolvePropertyValue( UIPropertyTypes.MAX_VALUE, pMaxValue, pMaxValue.value, context, doc, spec, errors );
                }

                break;
            }

            //
            // min/max length is equal to      <number>|<value>|<constant>|<ui_element>
            // min/max length in               <value_list>|<query>
            //
            case DataTestCaseGroup.LENGTH: {

                const pMinLength = propertiesMap.get(  UIPropertyTypes.MIN_LENGTH ) || null;
                const pMaxLength = propertiesMap.get( UIPropertyTypes.MAX_LENGTH ) || null;

                if ( isDefined( pMinLength ) ) {
                    cfg.minLength = Number(
                        await this.resolvePropertyValue( UIPropertyTypes.MIN_LENGTH, pMinLength, pMinLength.value, context, doc, spec, errors )
                    );
                }

                if ( isDefined( pMaxLength ) ) {
                    cfg.maxLength = Number(
                        await this.resolvePropertyValue( UIPropertyTypes.MAX_LENGTH, pMaxLength, pMaxLength.value, context, doc, spec, errors )
                    );
                }

                break;
            }

            case DataTestCaseGroup.COMPUTATION: { // not supported yet
                return null;
            }

            default: return null;
        }

        // Generate value
        let value = await this._dataGen.generate( dtc, cfg );

        // console.log( '--------------> ', value );

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
        spec: Spec,
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

            case Entities.UI_ELEMENT: {
                const uie = propertyValue.references[ 0 ] as UIElement;
                if ( isDefined( uie ) && isDefined( uie.info ) && isDefined( uie.info.fullVariableName ) ) {

                    // In cache?
                    let value = context.uieVariableToValueMap.get( uie.info.fullVariableName ) || null;

                    // Generate if not in cache
                    if ( ! isDefined( value ) ) {
                        value = await this.generate( uie.info.fullVariableName, context, doc, spec, errors );
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
                        query = this.resolveConstantsInQuery( query, propertyValue.references );
                        query = await this.resolveUIElementsInQuery( query, featureName, owner, context, doc, spec, errors );
                        return await this.resolveDatabaseReferenceInQuery( propType, query, databases[ 0 ] as Database, spec, errors );
                    }
                } else if ( hasTable ) {
                    if ( tables.length > 1 ) {
                        msg = 'Query cannot have more than one Table reference.';
                    } else {
                        let query = propertyValue.value.toString();
                        query = this.resolveConstantsInQuery( query, propertyValue.references );
                        query = await this.resolveUIElementsInQuery( query, featureName, owner, context, doc, spec, errors );
                        return await this.resolveTableReferenceInQuery( propType, query, tables[ 0 ] as Table, spec, errors );
                    }
                } else { // none
                    msg = 'Query must have a Database reference or a Table reference.';
                }

                if ( isDefined( msg ) ) {
                    const err = new RuntimeException( msg, owner.location );
                    errors.push( err );
                    return null;
                }

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
        spec: Spec,
        errors: LocatedException[]
    ): Promise< string > {

        const variables: string[] = ( new QueryParser() ).parseAnyVariables( query );
        if ( variables.length < 1 ) { // No variables
            return query;
        }

        const featureName = isDefined( currentFeatureName )
            ? currentFeatureName + Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR
            : '';

        // Map full variable names
        let variableToFullVariableMap = new Map< string, string >();
        for ( let variable of variables ) {
            if ( variable.indexOf( Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR ) < 0 ) {
                const fullVariable = variable.charAt( 0 ) + featureName + variable.substr( 1 );
                variableToFullVariableMap.set( variable, fullVariable );
            } else {
                variableToFullVariableMap.set( variable, variable );
            }
        }

        // const uiElements: UIElement[] = nodes
        //     .filter( node => node.nodeType === NodeTypes.UI_ELEMENT )
        //     .map( node => node as UIElement );

        const uieNameHandler = new UIElementNameHandler();

        let newQuery = query;
        for ( let variable of variables ) {

            let fullVariableName = variable;
            if ( null === uieNameHandler.extractFeatureNameOf( variable ) ) {
                fullVariableName = uieNameHandler.makeVariableName( currentFeatureName, variable );
            }

            let value = context.uieVariableToValueMap.get( fullVariableName ) || null;

            if ( null === value ) {
                value = await this.generate( fullVariableName, context, doc, spec, errors );
            }

            newQuery = this._queryRefReplacer.replaceUIElementInQuery( newQuery, variable, Array.isArray( value ) ? value[ 0 ] : value );
        }
        return newQuery;
    }

    async resolveDatabaseReferenceInQuery(
        propType: UIPropertyTypes,
        query: string,
        database: Database,
        spec: Spec,
        errors: LocatedException[]
    ): Promise< EntityValueType > {

        // Remove database reference from the query
        const newQuery = this._queryRefReplacer.replaceDatabaseInQuery( query, database.name );

        if ( this._dbQueryCache.has( newQuery ) ) {
            return this.properDataFor( propType, this._dbQueryCache.get( newQuery ) );
        }

        // Retrieve connection interface
        let intf = spec.databaseNameToInterfaceMap().get( database.name );

        // Create the connection interface if not available
        if ( ! intf ) {
            intf = new DatabaseWrapper();
            try {
                await intf.connect( database, spec.basePath );
            } catch ( err ) {
                errors.push( err );
                return null;
            }
            spec.databaseNameToInterfaceMap().set( database.name, intf );
        }

        const returnedData = await this.queryResult( newQuery, intf, errors );
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
        spec: Spec,
        errors: LocatedException[]
    ): Promise< EntityValueType > {

        // Replace table reference with its internal name
        const newQuery = this._queryRefReplacer.replaceTableInQuery( query, table.name, table.internalName );

        if ( this._tblQueryCache.has( newQuery ) ) {
            return this.properDataFor( propType, this._tblQueryCache.get( newQuery ) );
        }

        // Retrieve table interface
        let intf = spec.tableNameToInterfaceMap().get( table.name );

        // Create the table interface if not available
        if ( ! intf ) {
            intf = new InMemoryTableWrapper();
            try {
                await intf.connect( table );
            } catch ( err ) {
                errors.push( err );
                return null;
            }
            spec.tableNameToInterfaceMap().set( table.name, intf );
        }

        const returnedData = await this.queryResult( newQuery, intf, errors );
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