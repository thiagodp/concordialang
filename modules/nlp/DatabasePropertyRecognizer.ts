import { NLPResult } from '../../modules/nlp/NLPResult';
import { DatabaseProperty } from '../ast/Database';
import { ContentNode } from '../ast/Node';
import { LocatedException } from '../req/LocatedException';
import { Entities } from './Entities';
import { Intents } from './Intents';
import { NLP } from './NLP';
import { NLPException } from './NLPException';
import { NLPTrainer } from './NLPTrainer';
import { NLPResultProcessor, NodeSentenceRecognizer } from './NodeSentenceRecognizer';
import { RuleBuilder } from './RuleBuilder';
import { DATABASE_PROPERTY_SYNTAX_RULES, DEFAULT_DATABASE_PROPERTY_SYNTAX_RULE } from './SyntaxRules';

/**
 * Database property sentence recognizer.
 *
 * @author Thiago Delgado Pinto
 */
export class DatabasePropertyRecognizer {

    private _syntaxRules: any[];

    constructor( private _nlp: NLP ) {
        this._syntaxRules = this.buildSyntaxRules();
    }

    nlp(): NLP {
        return this._nlp;
    }

    isTrained( language: string ): boolean {
        return this._nlp.isTrained( language );
    }

    trainMe( trainer: NLPTrainer, language: string ) {
        return trainer.trainNLP( this._nlp, language, Intents.DATABASE );
    }

    /**
     * Recognize sentences of UI Elements using NLP.
     *
     * @param language Language to be used in the recognition.
     * @param nodes Nodes to be recognized.
     * @param errors Output errors.
     * @param warnings Output warnings.
     *
     * @throws Error If the NLP is not trained.
     */
    recognizeSentences(
        language: string,
        nodes: DatabaseProperty[],
        errors: LocatedException[],
        warnings: LocatedException[]
    ) {
        const recognizer = new NodeSentenceRecognizer( this._nlp );
        const syntaxRules = this._syntaxRules;

        let processor: NLPResultProcessor = function(
            node: ContentNode,
            r: NLPResult,
            errors: LocatedException[],
            warnings: LocatedException[]
        ): ContentNode {

            const recognizedEntityNames: string[] = r.entities.map( e => e.entity );

            // Must have a DS Property
            const propertyIndex: number = recognizedEntityNames.indexOf( Entities.DB_PROPERTY );
            if ( propertyIndex < 0 ) {
                const msg = 'Unrecognized: ' + node.content;
                warnings.push( new NLPException( msg, node.location ) );
                return;
            }
            const property: string = r.entities[ propertyIndex ].value;

            // Validating
            recognizer.validate( node, recognizedEntityNames, syntaxRules, property, errors, warnings );

            // Getting the values
            let values = r.entities
                .filter( e => e.entity == Entities.VALUE || e.entity == Entities.NUMBER )
                .map( e => e.value );

            if ( values.length < 1 ) {
                const msg = 'Value expected in the sentence "' + node.content + '".';
                errors.push( new NLPException( msg, node.location ) );
                return;
            }

            let item: DatabaseProperty = node as DatabaseProperty;
            item.property = property;
            item.value = values[ 0 ];
            return item;
        };

        recognizer.recognize(
            language,
            nodes,
            [ Intents.DATABASE ],
            'Database Property',
            errors,
            warnings,
            processor
        );
    }


    public buildSyntaxRules(): object[] {
        return ( new RuleBuilder() ).build(
            DATABASE_PROPERTY_SYNTAX_RULES, DEFAULT_DATABASE_PROPERTY_SYNTAX_RULE );
    }

}