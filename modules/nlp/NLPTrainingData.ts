
/**
 * Training data for the natural language processor.
 * 
 * @author Thiago Delgado Pinto
 */
export class NLPTrainingData {
    constructor(
        public intents: NLPTrainingIntent[] = [],
        public examples: NLPTrainingIntentExample[] = []
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