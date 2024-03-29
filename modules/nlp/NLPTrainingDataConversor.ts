import { NLPTrainingData, NLPTrainingEntity, NLPTrainingIntent, NLPTrainingIntentExample, NLPTrainingMatch } from './NLPTrainingData';

/**
 * Training data conversor.
 *
 * @author Thiago Delgado Pinto
 */
export class NLPTrainingDataConversor {

    /**
     * Build training data from a translation map and training documents.
     *
     * @param translationMap4NLP    Translation object map containing
     *                              intent name => entity name => match name => samples.
     *                              Example:
     *                              ```
     *                              {
     *                                  "intent1": {
     *                                      "entity1": {
     *                                          "match1": [ "sample1", "sample2" ],
     *                                          ...
     *                                      },
     *                                      ...
     *                                  },
     *                                  ...
     *                              }
     *                              ```
     * @param examples             Training examples.
     */
    convert( translationMap4NLP: any, examples: NLPTrainingIntentExample[] ): NLPTrainingData {

        let data: NLPTrainingData = new NLPTrainingData();

        // i18n
        for ( let intentName in translationMap4NLP ) {
            let intent: NLPTrainingIntent = new NLPTrainingIntent( intentName );
            for ( let entityName in translationMap4NLP[ intentName ] ) {
                let entity: NLPTrainingEntity = new NLPTrainingEntity( entityName );
                for ( let matchName in translationMap4NLP[ intentName ][ entityName ] ) {
                    let match: NLPTrainingMatch = new NLPTrainingMatch( matchName );
                    match.samples = translationMap4NLP[ intentName ][ entityName ][ matchName ];
                    // add the match to the entity
                    entity.matches.push( match );
                }
                // add the entity to the intent
                intent.entities.push( entity );
            }
            // add intent
            data.intents.push( intent );
        }

        // docs
        data.examples = examples;

        return data;
    }

}