import { Feature } from '../ast/Feature';
import { NodeExtractor } from './NodeExtractor';
import { DictionaryBasedNodeExtractor } from "./DictionaryBasedNodeExtractor";
import { Symbols } from "./Symbols";

export class FeatureExtractor

    extends DictionaryBasedNodeExtractor< Feature > 

    {

    public extract( line: string ): Feature {

        this._lineChecker.positionOf( )

        let title = this._lineChecker.textAfterSeparator( line, Symbols.TITLE_SEPARATOR );

        return {
            name: title,
            location: 
        };
    }

}