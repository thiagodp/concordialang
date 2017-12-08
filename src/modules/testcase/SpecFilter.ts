// WARNING: WIP !!!

/**
 * Specification filter.
 * 
 * @author Thiago Delgado Pinto
 */
export class SpecFilter {
    
    public minFeatureImportance: number = 1;  // 1..9
    public maxFeatureImportance: number = 9;  // 1..9

    public minScenarioImportance: number = 1;  // 1..9
    public maxScenarioImportance: number = 9;  // 1..9

    public featureName: string = null; // null == don't filter
    public scenarioName: string = null; // null == don't filter    
}