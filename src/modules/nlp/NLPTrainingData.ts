
/**
 * Training data
 * 
 * @author Thiago Delgado Pinto
 */
export class NLPTrainingData {
    constructor(
        public intents: Array< NLPIntent > = [],
        public examples: Array< NLPEntityUsageExample > = []
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

export class NLPEntityUsageExample {
    constructor(
        public entity: string, // result
        public sentences: string[] = []
    ) {
    }
}