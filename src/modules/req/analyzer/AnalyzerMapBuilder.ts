import { Keywords } from "../Keywords";
import { ImportAnalyzer } from "./ImportAnalyzer";
import { FeatureAnalyzer } from "./FeatureAnalyzer";
import { ScenarioAnalyzer } from "./ScenarioAnalyzer";

export class AnalyzerMapBuilder {

    public build(): Object {
        let map = {};
        map[ Keywords.IMPORT ] = new ImportAnalyzer();
        map[ Keywords.FEATURE ] = new FeatureAnalyzer();
        map[ Keywords.SCENARIO ] = new ScenarioAnalyzer();        
        return map;
    }

}