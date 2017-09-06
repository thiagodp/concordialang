import { DocumentProcessor } from "./DocumentProcessor";

/**
 * File processor
 * 
 * @author Thiago Delgado Pinto
 */
export interface FileProcessor {

    /**
     * Use a processor to process a file, line-by-line.
     * 
     * @param file Input file.
     * @param processor Processor.
     */
    process( file: string, processor: DocumentProcessor ): void;

}