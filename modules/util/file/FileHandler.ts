import { FileChecker } from "./FileChecker";
import { FileEraser } from "./FileEraser";
import { FileReader } from "./FileReader";
import { FileWriter } from "./FileWriter";

export interface FileHandler
    extends FileChecker, FileReader, FileWriter, FileEraser {

}
