import * as enumUtil from 'enum-util';

import {
    Constant,
    Database,
    DatabaseProperties,
    DatabaseProperty,
    EntityValue,
    EntityValueType,
    Node,
    Table,
    UIElement,
    UIPropertyTypes,
} from '../ast';
import { AlaSqlDatabaseInterface } from '../db/AlaSqlDatabaseInterface';
import { DatabaseJSDatabaseInterface } from '../db/DatabaseJSDatabaseInterface';
import { DatabaseToAbstractDatabase } from '../db/DatabaseToAbstractDatabase';
import { databaseTypeSupportTablesInQueries } from '../db/DatabaseTypes';
import { QueryParser } from '../db/QueryParser';
import { DatabaseInterface } from '../dbi/DatabaseInterface';
import { LocatedException, RuntimeException } from '../error';
import { Entities } from '../nlp/Entities';
import { AugmentedSpec, IN_MEMORY_DATABASE_NAME } from '../req/AugmentedSpec';
import { NodeTypes } from '../req/NodeTypes';
import { PropCfg, UIEPropertyCache } from '../testdata/dtc/prop-cfg';
import { QueryReferenceReplacer } from '../testdata/util/QueryReferenceReplacer';
import { UIElementPropertyExtractor } from '../util/UIElementPropertyExtractor';
import { adjustValueToTheRightType } from '../util/ValueTypeDetector';
import { extractVariableReferences, makeVariableName } from '../util/variable-reference';
import { DocContext } from './doc-context';



export async function solveVariable(
	variable: string,
	propertyCache: UIEPropertyCache,
	currentFeatureName: string,
	docContext: DocContext,
): Promise< EntityValueType > {

	let { feature, uie, property } = extractVariableReferences( variable );
	feature = feature || currentFeatureName;

	const fullVariableName = makeVariableName( feature, uie );

	const propCfg: PropCfg | undefined = propertyCache.get( fullVariableName );

	property = property || UIPropertyTypes.VALUE.toString();

	// UIE and property found ?
	if ( propCfg && propCfg[ property ] ) {
		return propCfg[ property ].value;
	}

	// Retrieve the property value. If needed, it generates the value and add it to the cache.
	return retrievePropertyValue(
		fullVariableName, property, propCfg, propertyCache, docContext );
}


// ============================================================================
//
// VALUE RETRIEVAL
//
// ============================================================================

/**
 * Retrieve and add to the cache if needed.
 *
 * @param fullVariableName
 * @param property
 * @param propCfg
 * @param propertyCache
 * @param docContext
 * @returns
 */
export async function retrievePropertyValue(
	fullVariableName: string,
	property: string,
	propCfg: PropCfg | undefined,
	propertyCache: UIEPropertyCache,
	docContext: DocContext,
): Promise< EntityValueType | null > {

	const { doc, spec, errors, location } = docContext;

	// Checking the UIE
	const uie: UIElement = spec.uiElementByVariable( fullVariableName, doc );
	if ( ! uie ) {
		const msg = `Referenced UI Element "${fullVariableName}" not found in "${doc.fileInfo.path}".`;
		errors.push( new RuntimeException( msg, location ) );
		return null;
	}

	// Checking the property
	if ( ! enumUtil.isValue( UIPropertyTypes, property ) ) {
		const accepted: string = enumUtil.getValues( UIPropertyTypes ).join( ', ' );
		const msg = `Referenced UI Element property "${property}" not found in "${doc.fileInfo.path}". Accepted values: ${accepted}.`;
		errors.push( new RuntimeException( msg, location ) );
		return null;
	}

	// Create a property configuration, if needed
	if ( ! propCfg ) {
		propCfg = {} as PropCfg;
	}

	const propExtractor = new UIElementPropertyExtractor();
	const propertiesMap = propExtractor.mapFirstPropertyOfEachType( uie );
	const currentFeatureName: string | null = doc.feature?.name || null;

	let value: EntityValueType = null;
	switch ( property as UIPropertyTypes ) {

		//
		// Static
		//

		case UIPropertyTypes.ID: { // TO-DO: Add support to CONSTANTS ?
			value = propExtractor.extractId( uie );
			break;
		}

		case UIPropertyTypes.TYPE: {
			value = propExtractor.extractType( uie );
			break;
		}

		case UIPropertyTypes.DATA_TYPE: {
			value = propExtractor.guessDataType(
				propExtractor.mapFirstPropertyOfEachType( uie )
			);
			break;
		}

		case UIPropertyTypes.EDITABLE: {
			value = propExtractor.extractIsEditable( uie );
			break;
		}

		case UIPropertyTypes.REQUIRED: {
			value = propExtractor.extractIsRequired( uie );
			break;
		}

		case UIPropertyTypes.LOCALE: {
			value = propExtractor.extractLocale( uie );
			break;
		}

		case UIPropertyTypes.LOCALE_FORMAT: {
			value = propExtractor.extractLocaleFormat( uie );
			break;
		}

		//
		// Possibly dynamic
		//

		default: {
			const prop = propertiesMap.get( property as UIPropertyTypes );
			if ( prop ) {
				value = await solvePropertyEntityValue(
					prop.value, propertyCache, currentFeatureName, docContext );
			}
		}

	}

	if ( value === null || value === undefined ) {
		return null;
	}

	// Property value that needs to be adjusted to number
	if ( property === UIPropertyTypes.MIN_LENGTH || property === UIPropertyTypes.MAX_LENGTH ) {
		value = Number( value );
	}

	// Set the property value
	propCfg[ property ] = { value } as any;

	// Set it (add/overwrite) in the cache
	propertyCache.set( fullVariableName, propCfg );

	return value;
}







// ============================================================================
//
// PROPERTY VALUE OR REFERENCE EXTRACTION FROM AN ENTITY
//
// ============================================================================


async function solvePropertyEntityValue(
	propEntity: EntityValue,
	propertyCache: UIEPropertyCache,
	currentFeatureName: string,
	docContext: DocContext,
): Promise< EntityValueType > {

	switch ( propEntity.entity ) {

		// Allowed References

		case Entities.CONSTANT: {
			return solveConstantInProperty( propEntity );
		}

		case Entities.UI_ELEMENT_REF:
		case Entities.UI_PROPERTY_REF: {
			return solveVariable(
				( propEntity.value as any ).toString().trim(),
				propertyCache,
				currentFeatureName,
				docContext,
			);
		}

		// Query (to Database or Table)

		case Entities.QUERY: {
			return solveQueryInProperty(
				propEntity,
				propertyCache,
				currentFeatureName,
				docContext,
			);
		}

		// Other cases (e.g., directly from the property)

		default: {
			return propEntity.value;
		}

	}
}


// ============================================================================
//
// CONSTANT
//
// ============================================================================


export function solveConstantInProperty( propEntity: EntityValue ): any {
	const constant = propEntity.references[ 0 ] as Constant;
	if ( constant ) {
		return adjustValueToTheRightType( constant.value );
	}
	return null;
}


// ============================================================================
//
// QUERY
//
// ============================================================================


export async function solveQueryInProperty(
	propEntity: EntityValue,
	propertyCache: UIEPropertyCache,
	currentFeatureName: string,
	docContext: DocContext,
): Promise< any > {

	const { doc, spec, errors, location } = docContext;

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

	const databases: Node[] = propEntity.references.filter( node => node.nodeType === NodeTypes.DATABASE );
	const tables: Node[] = propEntity.references.filter( node => node.nodeType === NodeTypes.TABLE );

	const hasDatabase: boolean = databases.length > 0;
	const hasTable: boolean = tables.length > 0;

	if ( hasDatabase && hasTable ) {
		const msg: string = 'Query cannot have a reference to a Database and a reference to a Table.';
		errors.push( new RuntimeException( msg, location ) );
		return null;
	}

	const nodes: Node[] = hasDatabase ? databases : tables;
	if ( nodes.length > 1 ) {
		const msg: string = hasDatabase
			? 'Query cannot have references to more than one Database.'
			: 'Query cannot have references to more than one Table.';

		errors.push( new RuntimeException( msg, location ) );
		return null;
	}

	try {
		let query = propEntity.value.toString();
		query = solveConstantsInQuery( query, propEntity.references );
		query = await solveUIElementsInQuery( query, currentFeatureName, propertyCache, docContext );
		if ( hasDatabase ) {
			return solveDatabasesInQuery( query, databases[ 0 ] as Database, spec, errors );
		}
		return solveTablesInQuery( query, tables[ 0 ] as Table, spec, errors );
	} catch ( e ) {
		const msg: string = doc.fileInfo.path + ': Error trying to process the query. ' + e.message;
		errors.push( new RuntimeException( msg, location ) );
		return null;
	}
}


/**
 * Returns the given query with constants replaced by their values.
 *
 * @param query Query
 * @param referencedNodes Referenced nodes
 * @returns
 */
function solveConstantsInQuery(
	query: string,
	referencedNodes: Node[]
): string {
	const constants: Constant[] = referencedNodes
		.filter( node => node.nodeType === NodeTypes.CONSTANT )
		.map( node => node as Constant );
	const queryRefReplacer = new QueryReferenceReplacer();
	let newQuery = query;
	for ( let c of constants ) {
		newQuery = queryRefReplacer.replaceConstantInQuery( newQuery, c.name, adjustValueToTheRightType( c.value ) );
	}
	return newQuery;
}

/**
 * Returns the given query with UIE references and UIE Property references replaced by their values.
 *
 * @param query Query
 * @param currentFeatureName Current Feature name
 * @param propertyCache Property cache
 * @returns
 */
async function solveUIElementsInQuery(
	query: string,
	currentFeatureName: string,
	propertyCache: UIEPropertyCache,
	docContext: DocContext,
): Promise< string > {

	const variables: string[] = ( new QueryParser() ).parseAnyVariables( query );
	if ( variables.length < 1 ) { // No variables to replace
		return query;
	}

	const queryRefReplacer = new QueryReferenceReplacer();

	let newQuery = query;
	for ( const variable of variables ) {

		// Retrieve the value
		const value = await solveVariable( variable, propertyCache, currentFeatureName, docContext );

		// Set in the query
		newQuery = queryRefReplacer.replaceUIElementInQuery(
			newQuery,
			variable,
			value
		);
	}

	return newQuery;
}


async function  solveDatabasesInQuery(
	query: string,
	database: Database,
	spec: AugmentedSpec,
	errors: LocatedException[]
): Promise< EntityValueType | null > {

	const absDB = ( new DatabaseToAbstractDatabase() ).convertFromNode( database );
	const supportTables = databaseTypeSupportTablesInQueries( absDB.driverName );

	// Remove database reference from the query
	const newQuery = ( new QueryReferenceReplacer() )
		.replaceDatabaseInQuery( query, database.name, ! supportTables );

	// Retrieve database interface
	let dbi: DatabaseInterface = spec.databaseNameToInterfaceMap().get( database.name );

	// Create the connection interface if not available
	if ( ! dbi ) {
		dbi = new DatabaseJSDatabaseInterface();
		try {
			await dbi.connect( database, spec.basePath );
		} catch ( err ) {
			errors.push( err );
			return null;
		}
		spec.databaseNameToInterfaceMap().set( database.name, dbi );
	}

	try {
		return await queryAndReturn( dbi, newQuery );
	} catch ( err ) {
		errors.push( err );
		return null;
	}
}


async function solveTablesInQuery(
	query: string,
	table: Table,
	spec: AugmentedSpec,
	errors: LocatedException[]
): Promise< EntityValueType > {

	// Replace table reference with its internal name
	const newQuery = ( new QueryReferenceReplacer() )
		.replaceTableInQuery( query, table.name, table.internalName );

	// Retrieve database interface
	let dbi: DatabaseInterface = spec.databaseNameToInterfaceMap().get( IN_MEMORY_DATABASE_NAME );

	// Create the table interface if not available
	if ( ! dbi ) {

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

		dbi = new AlaSqlDatabaseInterface();
		try {
			await dbi.connect( database, spec.basePath );
		} catch ( err ) {
			errors.push( err );
			return null;
		}
		spec.databaseNameToInterfaceMap().set( IN_MEMORY_DATABASE_NAME, dbi );
	}

	try {
		// Create the in-memory table with the data
		await dbi.createTable( table );
		return await queryAndReturn( dbi, newQuery );
	} catch ( err ) {
		errors.push( err );
		return null;
	}
}


async function queryAndReturn(
	dbi: DatabaseInterface,
	query: string
): Promise< EntityValueType | null > {
	// Query the data
	const returnedData = await dbi.query( query );
	// Extract the data from the first column only
	const firstColumnValues: any[] = valuesFromTheFirstColumn( returnedData );
	if ( firstColumnValues.length === 1 ) {
		return firstColumnValues[ 0 ]; // Single value
	}
	return firstColumnValues; // Array with more than one value
}


function valuesFromTheFirstColumn( data: any[] ): any[] {
	const values: any[] = [];
	for ( const rows of data || [] ) {
		for ( const column in rows || {} ) {
			values.push( rows[ column ] );
			break; // first column only !
		}
	}
	return values;
}
