import dbjs from 'database-js';
import { DatabaseToAbstractDatabase } from './DatabaseToAbstractDatabase';
import { isPathBasedDatabaseType } from './DatabaseTypes';
/**
 * Handles databases using DatabaseJS.
 *
 * @author Thiago Delgado Pinto
 */
export class DatabaseJSDatabaseInterface {
    constructor() {
        this._dbConnection = null;
        this._db = null;
        //
        // FROM DatabaseInterface
        //
        /** @inheritDoc */
        this.hasFileBasedDriver = (databaseType) => {
            return isPathBasedDatabaseType(databaseType);
        };
    }
    /** @inheritDoc */
    async isConnected() {
        return !!this._dbConnection;
    }
    /** @inheritDoc */
    async connect(db, basePath) {
        this._db = db;
        this._basePath = basePath;
        this._dbConnection = this.createConnectionFromNode(db, basePath); // may throw an Error
        return true;
    }
    /** @inheritDoc */
    async disconnect() {
        if (!this._dbConnection) {
            throw this.dbiError();
        }
        if (!!this._dbConnection.close) {
            return await this._dbConnection.close();
        }
        return true;
    }
    /** @inheritDoc */
    async reconnect() {
        if (!this._dbConnection) {
            throw this.dbiError();
        }
        if (await this.isConnected()) {
            await this.disconnect();
        }
        return await this.connect(this._db, this._basePath);
    }
    /** @inheritDoc */
    async exec(cmd, params) {
        if (!params) {
            return this._dbConnection.prepareStatement(cmd).execute();
        }
        return this._dbConnection.prepareStatement(cmd).execute(...params);
    }
    /** @inheritDoc */
    async createTable(table) {
        throw new Error('Table creation not supported for the DatabaseJS interface.');
    }
    //
    // FROM Queryable
    //
    /** @inheritDoc */
    async query(cmd, params) {
        if (!params) {
            return this._dbConnection.prepareStatement(cmd).query();
        }
        return this._dbConnection.prepareStatement(cmd).query(...params);
    }
    //
    // PRIVATE
    //
    /**
     * Returns a database connection from the given database node.
     *
     * @param db Database node.
     * @param basePath Base path, in case of the database is file-based.
     */
    createConnectionFromNode(db, basePath) {
        let conversor = new DatabaseToAbstractDatabase();
        let absDB = conversor.convertFromNode(db, basePath);
        return new dbjs.Connection(absDB);
    }
    /**
     * Return an error about DBI is not instantiated.
     */
    dbiError() {
        return new Error('Internal database interface not instantiated.');
    }
}
