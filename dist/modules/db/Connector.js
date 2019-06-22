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
const ConnectionResult_1 = require("../dbi/ConnectionResult");
const DatabaseWrapper_1 = require("./DatabaseWrapper");
const InMemoryTableWrapper_1 = require("./InMemoryTableWrapper");
/**
 * Creates connections.
 *
 * @author Thiago Delgado Pinto
 */
class Connector {
    connectToDatabase(db, basePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let intf = new DatabaseWrapper_1.DatabaseWrapper();
            try {
                yield intf.connect(db, basePath);
            }
            catch (err) {
                return ConnectionResult_1.ConnectionResult_.forDatabase(intf, err);
            }
            return ConnectionResult_1.ConnectionResult_.forDatabase(intf);
        });
    }
    connectToTable(table) {
        return __awaiter(this, void 0, void 0, function* () {
            let intf = new InMemoryTableWrapper_1.InMemoryTableWrapper();
            try {
                intf.connect(table);
            }
            catch (err) {
                return ConnectionResult_1.ConnectionResult_.forTable(intf, err);
            }
            return ConnectionResult_1.ConnectionResult_.forTable(intf);
        });
    }
}
exports.Connector = Connector;
