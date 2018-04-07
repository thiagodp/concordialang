import { UIProperty, UIElement, EntityValue, EntityValueType } from "../ast/UIElement";
import { Entities } from "../nlp/Entities";
import { Constant } from "../ast/Constant";
import { isDefined } from "./TypeChecking";
import { adjustValueToTheRightType } from "./ValueTypeDetector";
import { Spec } from "../ast/Spec";
import { Node } from "../ast/Node";
import { toEnumValue } from "./ToEnumValue";
import { NodeTypes } from "../req/NodeTypes";
import { LocatedException } from "../req/LocatedException";
import { RuntimeException } from "../req/RuntimeException";
import { Database } from "../ast/Database";
import { Table } from "../ast/Table";
import { DatabaseWrapper } from "../db/DatabaseWrapper";
import { InMemoryTableWrapper } from "../db/InMemoryTableWrapper";
import { QueryReferenceReplacer } from "./QueryReferenceReplacer";
import { Queryable } from "../req/Queryable";
import { UIPropertyTypes } from "./UIPropertyTypes";
import { QueryParser } from "../db/QueryParser";
import { Symbols } from "../req/Symbols";


export class UIPropertyValueResolver {

    private readonly _queryRefReplacer = new QueryReferenceReplacer();



    async resolve(
        currentFeatureName: string,
        owner: UIProperty,
        propType: UIPropertyTypes,
        propertyValue: EntityValue,
        context: ValueGenContext,
        spec: Spec,
        errors: LocatedException[]
    ): Promise< EntityValueType > {

        if ( ! propertyValue ) {
            return null;
        }

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
                    let value = context.uieVariableToValueMap.get( uie.info.fullVariableName ) || null;
                    if ( ! isDefined( value ) ) {
                        value = await this.generateValue( uie, context ); //?
                    }
                    return value;
                }
                return null;
            }

            // Values - Entity QUERY only.
            //          The entities VALUE, NUMBER, and VALUE_LIST were already processed by the UIPropertyRecognizer!

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

                const databases: Node [] = propertyValue.references.filter( node => node.nodeType === NodeTypes.DATABASE );
                const tables: Node [] = propertyValue.references.filter( node => node.nodeType === NodeTypes.TABLE );

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
                        query = await this.resolveUIElementsInQuery( query, currentFeatureName, context, owner, errors );
                        return await this.resolveDatabaseReferenceInQuery( propType, query, databases[ 0 ] as Database, spec, errors );
                    }
                } else if ( hasTable ) {
                    if ( tables.length > 1 ) {
                        msg = 'Query cannot have more than one Table reference.';
                    } else {
                        let query = propertyValue.value.toString();
                        query = this.resolveConstantsInQuery( query, propertyValue.references );
                        query = await this.resolveUIElementsInQuery( query, currentFeatureName, context, owner, errors );
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


    async generateValue(
        uie: UIElement,
        context: ValueGenContext
    ): Promise< EntityValueType > {
        return null; // TODO
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
        currentFeatureName: string,
        context: ValueGenContext,
        owner: UIProperty,
        errors: LocatedException[]
    ): Promise< string > {

        const variables: string[] = ( new QueryParser() ).parseAnyVariables( query );
        if ( variables.length < 1 ) {
            return query;
        }

        // Map full variable names
        let variableToFullVariableMap = new Map< string, string >();
        for ( let variable of variables ) {
            if ( variable.indexOf( Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR ) < 0 ) {
                const fullVariable = variable.charAt( 0 ) + currentFeatureName + Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR + variable.substr( 1 );
                variableToFullVariableMap.set( variable, fullVariable );
            } else {
                variableToFullVariableMap.set( variable, variable );
            }
        }

        // const uiElements: UIElement[] = nodes
        //     .filter( node => node.nodeType === NodeTypes.UI_ELEMENT )
        //     .map( node => node as UIElement );

        let newQuery = query;
        for ( let variable of variables ) {

            // Make full variable name if needed
            const fullVariableName = variable.indexOf( Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR ) < 0
                ? variable.charAt( 0 ) + currentFeatureName + Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR + variable.substr( 1 )
                : variable;

            let value = context.uieVariableToValueMap.get( fullVariableName ) || null;

            if ( null === value ) {
                // Makes an error
                const err = new RuntimeException( 'Query refers to a UI Element whose value was not found: ' + variable, owner.location );
                errors.push( err );

                // Keep going with an empty value
                value = ''; // or generate it ???
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

        // Returns the query data according to property type
        return this.dataFor( propType, await this.queryResult( newQuery, intf, errors ) );
    }


    async resolveTableReferenceInQuery(
        propType: UIPropertyTypes,
        query: string,
        table: Table,
        spec: Spec,
        errors: LocatedException[]
    ): Promise< EntityValueType > {

        // Replace table reference with its internal name
        const newQuery = this._queryRefReplacer.replaceTableInQuery( query, table.internalName );

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

        // Returns the query data according to property type
        return this.dataFor( propType, await this.queryResult( newQuery, intf, errors ) );
    }


    async queryResult( query: string, intf: Queryable, errors: LocatedException[] ): Promise< any > {
        try {
            return await intf.query( query );
        } catch ( err ) {
            errors.push( err );
            return null;
        }
    }

    dataFor( propType: UIPropertyTypes, data: any[] ): any {
        switch ( propType ) {
            case UIPropertyTypes.VALUE: return this.firstColumnOf( data );
            default: return this.firstCellOf( data );
        }
    }

    firstCellOf( data: any[] ): any {
        if ( ! data || data.length < 1 ) {
            return null;
        }
        const firstRow = data[ 0 ];
        for ( let key in firstRow ) {
            return firstRow[ key ];
        }
        return null;
    }

    firstColumnOf( data: any[] ): any[] | null {
        if ( ! data ) {
            return null;
        }
        const rowCount = data.length;
        if ( rowCount < 1 ) {
            return null;
        }
        let values: any[] = [], row;
        for ( let i = 0; i < rowCount; ++i ) {
            row = data[ i ];
            for ( let key in row ) {
                values.push( row[ key ] );
                break;
            }
        }
        return values;
    }

}


export class ValueGenContext {

    /**
     *
     * @param uieVariableToValueMap Maps a UI Element Variable to its value
     */
    constructor(
        public uieVariableToValueMap = new Map< string, EntityValueType >()
    ) {
    }

}