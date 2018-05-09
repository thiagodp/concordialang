"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Training data for the natural language processor.
 *
 * @author Thiago Delgado Pinto
 */
class NLPTrainingData {
    constructor(intents = [], examples = []) {
        this.intents = intents;
        this.examples = examples;
    }
}
exports.NLPTrainingData = NLPTrainingData;
/**
 * Training Intent.
 *
 * @author Thiago Delgado Pinto
 */
class NLPTrainingIntent {
    constructor(name, entities = []) {
        this.name = name;
        this.entities = entities;
    }
}
exports.NLPTrainingIntent = NLPTrainingIntent;
/**
 * Training Entity.
 *
 * @author Thiago Delgado Pinto
 */
class NLPTrainingEntity {
    constructor(name, matches = []) {
        this.name = name;
        this.matches = matches;
    }
}
exports.NLPTrainingEntity = NLPTrainingEntity;
/**
 * Match for the training data.
 *
 * @author Thiago Delgado Pinto
 */
class NLPTrainingMatch {
    constructor(id, samples = []) {
        this.id = id;
        this.samples = samples;
    }
}
exports.NLPTrainingMatch = NLPTrainingMatch;
/**
 * Entity usage example for the training data.
 *
 * @author Thiago Delgado Pinto
 */
class NLPTrainingIntentExample {
    constructor(intent, // result
    sentences = []) {
        this.intent = intent;
        this.sentences = sentences;
    }
}
exports.NLPTrainingIntentExample = NLPTrainingIntentExample;
//# sourceMappingURL=NLPTrainingData.js.map