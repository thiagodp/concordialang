
/**
 * Training data
 * 
 * @author Thiago Delgado Pinto
 */
export class NLPTrainingData {
    constructor(
        public intents: Array< NLPIntent > = [],
        public documents: Array< NLPTrainingSentence > = []
    ) {
    }
}

export class NLPIntent {
    constructor(
        public name: string,
        public entities: Array< NLPEntity > = []
    ) {
    }
}

export class NLPEntity {
    constructor(
        public name: string,
        public matches: Array< NLPMatch > = []
    ) {
    }
}

export class NLPMatch {
    constructor(
        public id: string,
        public samples: string[] = []
    ) {
    }        
}

export class NLPTrainingSentence {
    constructor(
        public entity: string, // result
        public sentence: string
    ) {
    }
}