"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbjs = require("database-js");
const DatabaseTypes_1 = require("./DatabaseTypes");
const DatabaseToAbstractDatabase_1 = require("./DatabaseToAbstractDatabase");
/**
 * Handles databases using DatabaseJS.
 *
 * @author Thiago Delgado Pinto
 */
class DatabaseJSDatabaseInterface {
    constructor() {
        this._dbConnection = null;
        this._db = null;
        //
        // FROM DatabaseInterface
        //
        /** @inheritDoc */
        this.hasFileBasedDriver = (databaseType) => {
            return DatabaseTypes_1.isPathBasedDatabaseType(databaseType);
        };
    }
    /** @inheritDoc */
    isConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            return !!this._dbConnection;
        });
    }
    /** @inheritDoc */
    connect(db, basePath) {
        return __awaiter(this, void 0, void 0, function* () {
            this._db = db;
            this._basePath = basePath;
            this._dbConnection = this.createConnectionFromNode(db, basePath); // may throw an Error
            return true;
        });
    }
    /** @inheritDoc */
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._dbConnection) {
                throw this.dbiError();
            }
            if (!!this._dbConnection.close) {
                return yield this._dbConnection.close();
            }
            return true;
        });
    }
    /** @inheritDoc */
    reconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._dbConnection) {
                throw this.dbiError();
            }
            if (yield this.isConnected()) {
                yield this.disconnect();
            }
            return yield this.connect(this._db, this._basePath);
        });
    }
    /** @inheritDoc */
    exec(cmd, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!params) {
                return this._dbConnection.prepareStatement(cmd).execute();
            }
            return this._dbConnection.prepareStatement(cmd).execute(...params);
        });
    }
    /** @inheritDoc */
    createTable(table) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Table creation not supported for the DatabaseJS interface.');
        });
    }
    //
    // FROM Queryable
    //
    /** @inheritDoc */
    query(cmd, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!params) {
                return this._dbConnection.prepareStatement(cmd).query();
            }
            return this._dbConnection.prepareStatement(cmd).query(...params);
        });
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
        let conversor = new DatabaseToAbstractDatabase_1.DatabaseToAbstractDatabase();
        let absDB = conversor.convertFromNode(db, basePath);
        return new dbjs.Connection(absDB);
    }
    /**
     * Return an error about DBI is not instantied.
     */
    dbiError() {
        return new Error('Internal database interface not instantied.');
    }
}
exports.DatabaseJSDatabaseInterface = DatabaseJSDatabaseInterface;
