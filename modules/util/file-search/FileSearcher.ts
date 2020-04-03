import { Options } from "../../app/Options";

export interface FileSearcher {

    searchFrom( options: Options ): Promise< string[] >;

}