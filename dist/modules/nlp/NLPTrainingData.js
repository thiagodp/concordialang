"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NLP_PRIORITIES = {
    "testcase": {
        "ui_action_modifier": 2,
        "ui_action": 2,
        "ui_element_type": 2,
        "ui_property": 1,
        "ui_action_option": 1,
        "exec_action": 1
    },
    "ui": {
        "ui_property": 1,
        "ui_connector": 1,
        "ui_connector_modifier": 1,
        "ui_data_type": 1,
        "bool_value": 1
    },
    "database": {
        "db_property": 1
    }
};
/**
 * Training data for the natural language processor.
 *
 * @author Thiago Delgado Pinto
 */
class NLPTrainingData {
    constructor(intents = [], examples = [], priorities) {
        this.intents = intents;
        this.examples = examples;
        this.priorities = priorities;
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
