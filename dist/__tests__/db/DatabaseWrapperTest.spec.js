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
const NodeTypes_1 = require("../../modules/req/NodeTypes");
const Database_1 = require("../../modules/ast/Database");
const DatabaseWrapper_1 = require("../../modules/db/DatabaseWrapper");
const path = require("path");
/**
 * @author Thiago Delgado Pinto
 */
describe('DatabaseWrapperTest', () => {
    let wrapper = null;
    const testDatabasePath = path.join(process.cwd(), '/__tests__/db/users.json');
    let makeDB = (name, path) => {
        return {
            nodeType: NodeTypes_1.NodeTypes.DATABASE,
            location: {},
            name: name,
            items: [
                {
                    nodeType: NodeTypes_1.NodeTypes.DATABASE_PROPERTY,
                    location: { line: 1, column: 1 },
                    property: Database_1.DatabaseProperties.TYPE,
                    value: 'json',
                    content: 'type is json'
                },
                {
                    nodeType: NodeTypes_1.NodeTypes.DATABASE_PROPERTY,
                    location: { line: 2, column: 1 },
                    property: Database_1.DatabaseProperties.PATH,
                    value: path,
                    content: 'path is "' + path + '"'
                }
                /*
                {
                    nodeType: NodeTypes.DATABASE_PROPERTY,
                    location: { line: 3, column: 1 } as Location,
                    property: DatabaseProperties.USERNAME,
                    value: 'root',
                    content: 'username is root'
                } as DatabaseProperty
                */
            ]
        };
    };
    let makeValidDB = () => {
        //console.log( testDatabasePath );
        return makeDB('JSON Test DB', testDatabasePath);
    };
    beforeEach(() => {
        wrapper = new DatabaseWrapper_1.DatabaseWrapper();
    });
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        if (yield wrapper.isConnected()) {
            yield wrapper.disconnect();
        }
    }));
    it('is able to connect to an existing database', () => __awaiter(this, void 0, void 0, function* () {
        let db = makeValidDB();
        try {
            let ok = yield wrapper.connect(db);
            expect(ok).toBeTruthy();
            let isConnected = yield wrapper.isConnected();
            expect(isConnected).toBeTruthy();
        }
        catch (e) {
            fail(e);
        }
    }));
    /* DISABLED BECAUSE sqlite ALLOWS CONNECTING TO NON EXISTENT DATABASES.
    it( 'fails when trying to connect to a non existing database', async () => {
        let db = makeDB( 'Non Existent DB', './non-existing-db.sqlite' );
        try {
            await wrapper.connect( db );
            fail( 'Should not connect' );
        } catch ( e ) {
            expect( e.message ).toMatch( /unknown database/i );
        }

    } );
    */
    it('is able to verify whether is connected', () => __awaiter(this, void 0, void 0, function* () {
        try {
            let isConnected = yield wrapper.isConnected();
            expect(isConnected).toBeFalsy();
        }
        catch (e) {
            fail(e);
        }
    }));
    it('is able to query', () => __awaiter(this, void 0, void 0, function* () {
        let db = makeValidDB();
        try {
            yield wrapper.connect(db);
            let results = yield wrapper.query('SELECT * WHERE name LIKE ?', ['Bob']);
            //console.log( results );
            expect(results).toBeDefined();
            expect(results).toHaveLength(1);
            const firstObj = results[0];
            expect(firstObj).toHaveProperty("username");
            expect(firstObj.username).toBe('bob');
        }
        catch (e) {
            fail(e);
        }
    }));
});
//# sourceMappingURL=DatabaseWrapperTest.spec.js.map