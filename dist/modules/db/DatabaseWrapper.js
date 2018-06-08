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
const DatabaseTypes_1 = require("./DatabaseTypes");
const DatabaseToAbstractDatabase_1 = require("./DatabaseToAbstractDatabase");
const dbjs = require("database-js");
/**
 * A simple database wrapper.
 *
 * @author Thiago Delgado Pinto
 */
class DatabaseWrapper {
    constructor() {
        this._dbi = null; // internal database interface
        this._db = null;
        /** @inheritDoc */
        this.hasFileBasedDriver = (databaseType) => {
            return DatabaseTypes_1.isPathBasedDatabaseType(databaseType);
        };
    }
    /** @inheritDoc */
    isConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            return !!this._dbi;
        });
    }
    /** @inheritDoc */
    connect(db, basePath) {
        return __awaiter(this, void 0, void 0, function* () {
            this._db = db;
            this._dbi = this.createConnectionFromNode(db, basePath); // may throw an Error
            return true;
        });
    }
    /** @inheritDoc */
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._dbi) {
                throw this.dbiError();
            }
            if (!!this._dbi.close) {
                return yield this._dbi.close();
            }
            return true;
        });
    }
    /** @inheritDoc */
    reconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._dbi) {
                throw this.dbiError();
            }
            if (yield this.isConnected()) {
                yield this.disconnect();
            }
            return yield this.connect(this._db);
        });
    }
    /** @inheritDoc */
    exec(cmd, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!params) {
                return this._dbi.prepareStatement(cmd).execute();
            }
            return this._dbi.prepareStatement(cmd).execute(...params);
        });
    }
    /** @inheritDoc */
    query(cmd, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!params) {
                return this._dbi.prepareStatement(cmd).query();
            }
            return this._dbi.prepareStatement(cmd).query(...params);
        });
    }
    //
    // private
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
exports.DatabaseWrapper = DatabaseWrapper;
