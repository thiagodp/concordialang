
interface StringEntityRecognizer {
    result: string;
    sample: string;
}

interface Entity {
    name: string;
    id: string;
}

interface Intent {
    name: string;
    entities: Array< Entity >;
}

interface ReservedWords {
    feature: Array< string >;
    scenario: Array< string >;
    given: Array< string >;
    when: Array< string >;
    then: Array< string >;
}

interface TrainingSamples {
    document: string;
    intent: string; // id?
}

/**
 * Detects some kinds of sentences.
 */
class SentenceDetector {

    constructor( private words: ReservedWords ) {
    }

    /**
     * Returns true if the line starts with a feature (e.g.: in english,
     * it should start with the word "feature").
     * 
     * @param line Line to be evaluated.
     */
    isFeature( line: string ): boolean {
        return this.lineStartsWith( line, this.words.feature );
    }    

    /**
     * Returns true if the line starts with a scenario (e.g.: in english,
     * it should start with the word "scenario").
     * 
     * @param line Line to be evaluated.
     */
    isScenario( line: string ): boolean {
        return this.lineStartsWith( line, this.words.scenario );
    }

    /**
     * Returns true if the given line starts with one of the given words.
     * 
     * @param line Line to be evaluated.
     * @param words Words to be found.
     */
    protected lineStartsWith( line: string, words: Array< string > ): boolean {
        let text: string = line.trim().toLowerCase();
        let w: string;
        for ( let i in words ) {
            w = words[ i ].toLowerCase();
            if ( 0 === text.indexOf( w ) ) {
                return true;
            }
        }
        return false;        
    }

}