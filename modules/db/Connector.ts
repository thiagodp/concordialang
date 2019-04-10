import { ConnectionResult_ } from "concordialang-types";
import { Database, Table } from "concordialang-types";
import { DatabaseWrapper } from "./DatabaseWrapper";
import { InMemoryTableWrapper } from "./InMemoryTableWrapper";

/**
 * Creates connections.
 *
 * @author Thiago Delgado Pinto
 */
export class Connector {

    async connectToDatabase( db: Database, basePath?: string ): Promise< ConnectionResult_ > {
        let intf = new DatabaseWrapper();
        try {
            await intf.connect( db, basePath );
        } catch ( err ) {
            return ConnectionResult_.forDatabase( intf, err );
        }
        return ConnectionResult_.forDatabase( intf );
    }


    async connectToTable( table: Table ): Promise< ConnectionResult_ > {
        let intf = new InMemoryTableWrapper();
        try {
            intf.connect( table );
        } catch ( err ) {
            return ConnectionResult_.forTable( intf, err );
        }
        return ConnectionResult_.forTable( intf );
    }

}