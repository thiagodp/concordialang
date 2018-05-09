"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NLPTrainingData_1 = require("./NLPTrainingData");
/**
 * Training data conversor.
 *
 * @author Thiago Delgado Pinto
 */
class NLPTrainingDataConversor {
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
    convert(translationMap4NLP, examples) {
        let data = new NLPTrainingData_1.NLPTrainingData();
        // i18n
        for (let intentName in translationMap4NLP) {
            let intent = new NLPTrainingData_1.NLPTrainingIntent(intentName);
            for (let entityName in translationMap4NLP[intentName]) {
                let entity = new NLPTrainingData_1.NLPTrainingEntity(entityName);
                for (let matchName in translationMap4NLP[intentName][entityName]) {
                    let match = new NLPTrainingData_1.NLPTrainingMatch(matchName);
                    match.samples = translationMap4NLP[intentName][entityName][matchName];
                    // add the match to the entity
                    entity.matches.push(match);
                }
                // add the entity to the intent
                intent.entities.push(entity);
            }
            // add intent            
            data.intents.push(intent);
        }
        // docs
        data.examples = examples;
        return data;
    }
}
exports.NLPTrainingDataConversor = NLPTrainingDataConversor;
//# sourceMappingURL=NLPTrainingDataConversor.js.map