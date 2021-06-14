import alasql from 'alasql';
import { AlaSqlTableCreator } from './AlaSqlTableCreator';
import { SqlHelper } from './SqlHelper';
/**
 * Handles in-memory databases using AlaSql.
 *
 * @author Thiago Delgado Pinto
 */
export class AlaSqlDatabaseInterface {
    constructor() {
        this._sqlHelper = new SqlHelper();
    }
    //
    // FROM DatabaseInterface
    //
    /** @inheritDoc */
    hasFileBasedDriver(databaseType) {
        const dbType = databaseType.toLowerCase();
        return 'memory' === dbType || 'alasql' === dbType;
    }
    /** @inheritDoc */
    async isConnected() {
        return true; // currently always true
    }
    /** @inheritDoc */
    async connect(db, basePath) {
        this._db = db;
        this._basePath = basePath;
        // @ts-ignore
        this.dbConnection = new alasql.Database(db.name); // Cannot be new AlaSqlDatabase !
        alasql(this._sqlHelper.generateUse(db.name));
        return true;
    }
    /** @inheritDoc */
    async disconnect() {
        // Currently does nothing
        return true;
    }
    /** @inheritDoc */
    async reconnect() {
        if (await this.isConnected()) {
            await this.disconnect();
        }
        if (!this._db) {
            return false;
        }
        return await this.connect(this._db, this._basePath);
    }
    /** @inheritDoc */
    async exec(cmd, params) {
        // console.log( 'CMD', cmd, 'PARAMETERS', params );
        return new Promise((resolve, reject) => {
            if (!this.dbConnection) {
                let e = new Error('Database is not connected.');
                return reject(e);
            }
            try {
                this.dbConnection.exec(cmd, params, (data) => resolve(data));
                // // @ts-ignore
                // let select = alasql.compile( cmd );
                // let data = select( params );
                // resolve( data );
            }
            catch (e) {
                // console.log( 'CMD ERROR', e.message );
                reject(e);
            }
        });
    }
    /** @inheritDoc */
    async createTable(table) {
        if (!this.dbConnection) {
            throw new Error('Database is not connected.');
        }
        const creator = new AlaSqlTableCreator();
        return await creator.createTableFromNode(this.dbConnection, table);
    }
    //
    // FROM Queryable
    //
    /** @inheritDoc */
    async query(cmd, params) {
        const removeProblematicChars = s => s; //( s: string ) => s.replace( /'/g, '' );
        let p = params;
        if (p !== undefined) {
            if (Array.isArray(p)) {
                p = p.map(removeProblematicChars);
            }
        }
        return await this.exec(cmd, params);
    }
}
