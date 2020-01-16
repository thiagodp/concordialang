
export type PriorityDef = { [key: string]: { [subKey: string]: undefined | null | number } };

export const NLP_PRIORITIES: PriorityDef = {
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
export class NLPTrainingData {
    constructor(
        public intents: NLPTrainingIntent[] = [],
        public examples: NLPTrainingIntentExample[] = [],
        public priorities?: PriorityDef
    ) {
    }
}

/**
 * Training Intent.
 *
 * @author Thiago Delgado Pinto
 */
export class NLPTrainingIntent {
    constructor(
        public name: string,
        public entities: NLPTrainingEntity[] = []
    ) {
    }
}

/**
 * Training Entity.
 *
 * @author Thiago Delgado Pinto
 */
export class NLPTrainingEntity {
    constructor(
        public name: string,
        public matches: NLPTrainingMatch[] = []
    ) {
    }
}

/**
 * Match for the training data.
 *
 * @author Thiago Delgado Pinto
 */
export class NLPTrainingMatch {
    constructor(
        public id: string,
        public samples: string[] = []
    ) {
    }
}

/**
 * Entity usage example for the training data.
 *
 * @author Thiago Delgado Pinto
 */
export class NLPTrainingIntentExample {
    constructor(
        public intent: string, // result
        public sentences: string[] = []
    ) {
    }
}