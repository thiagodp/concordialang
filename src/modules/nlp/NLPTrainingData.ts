/**
 * Training Data
 * 
 * @author Thiago Delgado Pinto
 */
export interface NLPTrainingData {
    intents: Array< Intent >;
    documents: Array< TrainingSentence >;
}

interface Intent {
    name: string;
    entities: Array< Entity >;
    matches: Array< Match >;
}

interface Entity {
    name: string;
    //id: string;
}

interface Match {
    entityId: string; // result
    sampleText: string; // sample
}

interface TrainingSentence {
    entityId: string; // result
    sentence: string;    
}
