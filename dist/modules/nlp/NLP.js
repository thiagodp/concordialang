"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bravey = require("../../lib/bravey"); // .js file
const nlp_1 = require("concordialang-types/nlp");
const ValueTypeDetector_1 = require("../util/ValueTypeDetector");
/**
 * Natural Language Processor
 *
 * @author Thiago Delgado Pinto
 */
class NLP {
    constructor(_useFuzzyProcessor = true) {
        this._useFuzzyProcessor = _useFuzzyProcessor;
        this._nlpMap = {}; // Maps language => Bravey.NLP
        this._additionalEntities = [];
        this._additionalRecognizers = [];
        const erMaker = new EntityRecognizerMaker();
        // Add an entity named "value" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.VALUE);
        this._additionalRecognizers.push(erMaker.makeValue(nlp_1.Entities.VALUE));
        // Add an entity named "ui_element" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.UI_ELEMENT);
        this._additionalRecognizers.push(erMaker.makeUIElement(nlp_1.Entities.UI_ELEMENT));
        // Add an entity named "ui_element_literal" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.UI_LITERAL);
        this._additionalRecognizers.push(erMaker.makeUILiteral(nlp_1.Entities.UI_LITERAL));
        // Add an entity named "number" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.NUMBER);
        this._additionalRecognizers.push(erMaker.makeNumber(nlp_1.Entities.NUMBER));
        // Add an entity named "query" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.QUERY);
        this._additionalRecognizers.push(erMaker.makeQuery(nlp_1.Entities.QUERY));
        // Add an entity named "constant" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.CONSTANT);
        this._additionalRecognizers.push(erMaker.makeConstant(nlp_1.Entities.CONSTANT));
        // Add an entity named "value_list" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.VALUE_LIST);
        this._additionalRecognizers.push(erMaker.makeValueList(nlp_1.Entities.VALUE_LIST));
        // Add an entity named "state" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.STATE);
        this._additionalRecognizers.push(erMaker.makeState(nlp_1.Entities.STATE));
        // Add an entity named "command" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.COMMAND);
        this._additionalRecognizers.push(erMaker.makeCommand(nlp_1.Entities.COMMAND));
    }
    /**
     * Train the recognizer.
     *
     * @param language Target language.
     * @param data Data to be used in the training.
     * @param intentNameFilter Filter for training only using certain intent. Optional. Default undefined.
     */
    train(language, data, intentNameFilter = undefined) {
        if (!this._nlpMap[language]) {
            this._nlpMap[language] = { nlp: this.createNLP(), isTrained: true };
        }
        else {
            this._nlpMap[language].isTrained = true;
        }
        let nlp = this._nlpMap[language].nlp;
        // Add intents and their recognizers
        for (let intent of data.intents) {
            // Ignores the intent if it is equal to the filter (if defined)
            if (intentNameFilter && intentNameFilter != intent.name) {
                continue; // ignore the intent
            }
            let entities = intent.entities.map(e => { return { id: e.name, entity: e.name }; });
            this.addDefaultEntitiesTo(entities);
            // Add the intent with its entities
            nlp.addIntent(intent.name, entities);
            // Add entity recognizers with matches. Each match have sample values, that
            // are added to the recognizer.
            for (let e of intent.entities) {
                let entityRec = new Bravey.StringEntityRecognizer(e.name);
                for (let m of e.matches) {
                    for (let sample of m.samples) {
                        entityRec.addMatch(m.id, sample);
                    }
                }
                nlp.addEntity(entityRec);
            }
        }
        // Add other needed recognizers
        this.addDefaultRecognizersTo(nlp);
        // Train with examples that include the added entities
        let opt = this.documentTrainingOptions();
        for (let ex of data.examples) {
            for (let sentence of ex.sentences) {
                nlp.addDocument(sentence, ex.intent, opt);
            }
        }
    }
    /**
     * Returns true if the NLP is trained for a certain language.
     *
     * @param language Language
     */
    isTrained(language) {
        if ((!this._nlpMap[language])) {
            return false;
        }
        return this._nlpMap[language].isTrained;
    }
    /**
     * Recognizes a sentece.
     *
     * @param language Language to be used in the recognition.
     * @param sentence Sentence to be recognized.
     * @param entityFilter Filters the entity to be recognized. Defaults to '*' which means "all" .
     */
    recognize(language, sentence, entityFilter = '*') {
        let nlp;
        if (!this._nlpMap[language]) {
            // Creates an untrained NLP
            this._nlpMap[language] = { nlp: this.createNLP(), isTrained: false };
        }
        nlp = this._nlpMap[language].nlp;
        let method = '*' == entityFilter || !entityFilter ? 'anyEntity' : entityFilter; // | "default"
        let r = nlp.test(sentence, method);
        // console.log(
        //     'Sentence  :', sentence, "\n",
        //     'Recognized:', r.text
        // );
        return r;
    }
    createNLP() {
        return this._useFuzzyProcessor ? new Bravey.Nlp.Fuzzy() : new Bravey.Nlp.Sequential();
    }
    documentTrainingOptions() {
        return { fromTaggedSentence: true, expandIntent: true };
    }
    /**
     * Adds default entities to the given entities array.
     *
     * @param entities Entities in which the default entities will be added.
     */
    addDefaultEntitiesTo(entities) {
        for (let entityName of this._additionalEntities) {
            entities.push({ id: entityName, entity: entityName });
        }
    }
    /**
     * Add default recognizers to the given processor.
     * @param nlp Processor
     */
    addDefaultRecognizersTo(nlp) {
        for (let rec of this._additionalRecognizers) {
            nlp.addEntity(rec);
        }
    }
}
exports.NLP = NLP;
/**
 * EntityRecognizer maker
 *
 * @author Thiago Delgado Pinto
 */
class EntityRecognizerMaker {
    /**
     * Creates a recognizer for values between quotes.
     *
     * Example: I fill "name" with "Bob"
     * --> The words "name" and "Bob" are recognized (without quotes).
     *
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    makeValue(entityName) {
        let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        const regex = /"(?:[^"\\]|\\.)*"/g;
        valueRec.addMatch(regex, function (match) {
            const value = match[0] || '';
            return value.substring(1, value.length - 1); // exclude quotes
        }, 100 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for values between { and }.
     *
     * Example: I fill {Name} with "Bob"
     * --> The word "Name" is recognized (without quotes).
     *
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    makeUIElement(entityName) {
        var valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        const regex = new RegExp('\{[a-zA-ZÀ-ÖØ-öø-ÿ][^<\r\n\>\}]*\}', "g");
        valueRec.addMatch(regex, function (match) {
            //console.log( 'match: ', match );
            return match.toString().replace('{', '').replace('}', '');
        }, 100 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for values between < and >, with restrictions.
     *
     * Example: I fill <username> with "Bob"
     * --> The word "username" is recognized (without quotes).
     *
     * Supported formats: <id>, <#id>, <@name>, <.css>, <//xpath>, and <~mobilename>.
     *
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    makeUILiteral(entityName) {
        var valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        // const regex = /(?:\<)((?:#|@|\.|\/\/|~|[a-zA-ZÀ-ÖØ-öø-ÿ])[^<\r\n\>]*)(?:\>)/g;
        // const regex = /(?:\<)((?:#|@|\.|\/\/|~|[a-zA-ZÀ-ÖØ-öø-ÿ])[^<\r\n]*)(?:\>)/g; // Issue #19
        const regex = /(?:\<)((?:#|@|\.|\/\/|~|[a-zA-ZÀ-ÖØ-öø-ÿ0-9 ]?)[^<\r\n]*[^\\>])(?:\>)/g;
        valueRec.addMatch(regex, function (match) {
            //console.log( 'match: ', match );
            return match[1].toString();
        }, 100 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for a number.
     *
     * Example: I fill {Name} with -10.33
     * --> The value -10.33 is recognized.
     *
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    makeNumber(entityName) {
        var valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        const regex = /(-?[0-9]+(?:\.[0-9]+)?)/g;
        valueRec.addMatch(regex, function (match) {
            // console.log( 'match ', match );
            return match[0].toString().trim();
        }, 10 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for values that start with select.
     *
     * Example: - value comes from the query "SELECT * FROM users"
     * --> The value "SELECT * FROM users" (without quotes) is recognized.
     *
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */
    makeQuery(entityName) {
        let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        const regex = new RegExp('"(?:\t| )*SELECT[^"]+"', "gi");
        valueRec.addMatch(regex, function (match) {
            // return match.toString().replace( /["]+/g, '' ).trim();
            const content = match.toString();
            return content.substring(1, content.length - 1).trim();
        }, 200 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for Constant references in the format [name].
     * A Constant name should not:
     * - be a number, e.g., [1] is invalid.
     * - have a dollar sign, e.g., [Foo$] is invalid.
     * - have spaces around, e.g., [ Foo ] is invalid.
     * - have quotes, e.g., [Foo"] is invalid.
     *
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */
    makeConstant(entityName) {
        var valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        const regex = /\[[a-zA-ZÀ-ÖØ-öø-ÿ_][a-zA-ZÀ-ÖØ-öø-ÿ0-9 _-]*\]/g;
        valueRec.addMatch(regex, function (match) {
            const value = match[0].toString();
            return value.substring(1, value.length - 1); // exclude '[' and ']'
        }, 10 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for a list of values, in the format [ 1, "hello", 2, "hi \"Jane\"!" ]
     *
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */
    makeValueList(entityName) {
        var valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        // const regex = /\[(?: )*((?:,) ?|([0-9]+(\.[0-9]+)?|\"(.*[^\\])\"))+(?: )*\]/g;
        // const regex = /(\[[\t ]*([^\]])*[\t ]*[^\\]\])+/g; // only [ anything ]
        // const regex = /(?:\[[\t ]*)(("[^"]*"|(-?[0-9]+(\.[0-9]+)?))*,?[\t ]?)+[^\]]?(?:\])/g; // [ value or number ]
        const regex = /(?:\[[\t ]*)(("(\\"|[^"])+"|(-?[0-9]+(\.[0-9]+)?))+,?[\t ]?)+[^\]]?(?:\])/g; // [ value or number ]
        valueRec.addMatch(regex, function (match) {
            // console.log( 'match: ', match );
            // return match[ 0 ].toString().trim();
            let content = match[0].toString().trim();
            content = content.substring(1, content.length - 1); // Remove [ and ]
            const contentRegex = /(((-?[0-9]+(?:\.[0-9]+)?)|"(\\"|[^"])+"))+/g;
            let values = [];
            let result;
            while ((result = contentRegex.exec(content)) !== undefined) {
                if (null === result) {
                    break;
                }
                const v = result[0];
                if (v.startsWith('"')) {
                    values.push(v.substring(1, v.length - 1)); // Remove quotes
                }
                else {
                    values.push(ValueTypeDetector_1.adjustValueToTheRightType(v));
                }
            }
            // console.log( "VALUES:", values );
            return values;
        }, 1000 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for State references in the format ~name~.
     * A State name should not:
     * - be a number, e.g., [1] is invalid.
     * - have a dollar sign, e.g., [Foo$] is invalid.
     * - have spaces around, e.g., [ Foo ] is invalid.
     * - have quotes, e.g., [Foo"] is invalid.
     *
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */
    makeState(entityName) {
        var valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        const regex = /\~[a-zA-ZÀ-ÖØ-öø-ÿ_][a-zA-ZÀ-ÖØ-öø-ÿ0-9 _-]*\~/g;
        valueRec.addMatch(regex, function (match) {
            const value = match[0].toString();
            return value.substring(1, value.length - 1); // exclude '~' and '~'
        }, 10 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for values between single quotes
     *
     * Example: I run the command 'DELETE FROM users'
     * --> the value 'DELETE FROM users' (without single quotes) is recognized.
     *
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */
    makeCommand(entityName) {
        let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        const regex = /'(?:[^'\\]|\\.)*'/g;
        valueRec.addMatch(regex, function (match) {
            const content = match.toString();
            return content.substring(1, content.length - 1).trim();
        }, 500 // priority
        );
        return valueRec;
    }
}
