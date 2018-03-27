import { Queryable } from "./Queryable";
import { Table } from "../ast/Table";

/**
 * In-memory table interface
 *
 * @author Thiago Delgado Pinto
 */
export interface InMemoryTableInterface extends Queryable {

    /**
     * Checks if it is connected to an in-memory table.
     */
    isConnected(): Promise< boolean >;

    /**
     * Creates a in-memory table.
     */
    connect( table: Table ): Promise< void >;

    /**
     * Clears the in-memory table.
     */
    disconnect(): Promise< void >;
}