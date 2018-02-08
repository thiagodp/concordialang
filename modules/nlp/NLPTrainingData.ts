
/**
 * Training data for the natural language processor.
 * 
 * @author Thiago Delgado Pinto
 */
export class NLPTrainingData {
    constructor(
        public intents: Array< NLPIntent > = [],
        public examples: Array< NLPIntentExample > = []
    ) {
    }
}

/**
 * Intent for the training data.
 * 
 * @author Thiago Delgado Pinto
 */
export class NLPIntent {
    constructor(
        public name: string,
        public entities: Array< NLPEntity > = []
    ) {
    }
}

/**
 * Entity for the training data.
 * 
 * @author Thiago Delgado Pinto
 */
export class NLPEntity {
    constructor(
        public name: string,
        public matches: Array< NLPMatch > = []
    ) {
    }
}

/**
 * Match for the training data.
 * 
 * @author Thiago Delgado Pinto
 */
export class NLPMatch {
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
export class NLPIntentExample {
    constructor(
        public intent: string, // result
        public sentences: string[] = []
    ) {
    }
}