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
const alasql = require("alasql");
const SqlHelper_1 = require("./SqlHelper");
const AlaSqlTableCreator_1 = require("./AlaSqlTableCreator");
/**
 * Handles in-memory databases using AlaSql.
 *
 * @author Thiago Delgado Pinto
 */
class AlaSqlDatabaseInterface {
    constructor() {
        this._sqlHelper = new SqlHelper_1.SqlHelper();
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
    isConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            return true; // currently always true
        });
    }
    /** @inheritDoc */
    connect(db, basePath) {
        return __awaiter(this, void 0, void 0, function* () {
            this._db = db;
            this._basePath = basePath;
            // @ts-ignore
            this.dbConnection = new alasql.Database(db.name); // Cannot be new AlaSqlDatabase !
            alasql(this._sqlHelper.generateUse(db.name));
            return true;
        });
    }
    /** @inheritDoc */
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            // Currently does nothing
            return true;
        });
    }
    /** @inheritDoc */
    reconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isConnected()) {
                yield this.disconnect();
            }
            if (!this._db) {
                return false;
            }
            return yield this.connect(this._db, this._basePath);
        });
    }
    /** @inheritDoc */
    exec(cmd, params) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    /** @inheritDoc */
    createTable(table) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.dbConnection) {
                throw new Error('Database is not connected.');
            }
            const creator = new AlaSqlTableCreator_1.AlaSqlTableCreator();
            return yield creator.createTableFromNode(this.dbConnection, table);
        });
    }
    //
    // FROM Queryable
    //
    /** @inheritDoc */
    query(cmd, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.exec(cmd, params);
        });
    }
}
exports.AlaSqlDatabaseInterface = AlaSqlDatabaseInterface;
