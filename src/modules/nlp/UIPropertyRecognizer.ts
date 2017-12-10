import { RuleBuilder } from './RuleBuilder';
import { UI_PROPERTY_SYNTAX_RULES, DEFAULT_UI_PROPERTY_SYNTAX_RULE } from './SyntaxRules';
import { Intents } from './Intents';
import { NodeSentenceRecognizer, NLPResultProcessor } from "./NodeSentenceRecognizer";
import { UIProperty } from "../ast/UIElement";
import { LocatedException } from "../req/LocatedException";
import { ContentNode } from "../ast/Node";
import { NLP } from "./NLP";
import { NLPResult } from '../../modules/nlp/NLPResult';
import { NLPException } from "./NLPException";
import { Entities } from "./Entities";
import { Warning } from "../req/Warning";
import { NLPTrainer } from './NLPTrainer';

/**
 * UI element property sentence recognizer.
 * 
 * @author Thiago Delgado Pinto
 */
export class UIPropertyRecognizer {

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
        return trainer.trainNLP( this._nlp, language, Intents.UI );
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
        nodes: UIProperty[],
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
        ) {
            const recognizedEntityNames: string[] = r.entities.map( e => e.entity );

            // Must have a UI Property
            const propertyIndex: number = recognizedEntityNames.indexOf( Entities.UI_PROPERTY );
            if ( propertyIndex < 0 ) {
                const msg = 'Unrecognized: ' + node.content;
                errors.push( new NLPException( msg, node.location ) );
                return;
            }
            const property: string = r.entities[ propertyIndex ].value;

            // Validating
            recognizer.validate( node, recognizedEntityNames, syntaxRules, property, errors, warnings );

            // Getting the values
            let item: UIProperty = node as UIProperty;
            item.property = property;
            item.values = r.entities.filter( ( e, i ) => i !== propertyIndex ).map( e => e.value );
        };

        recognizer.recognize(
            language,
            nodes,
            Intents.UI,
            'UI Element',
            errors,
            warnings,
            processor
        );
    }


    public buildSyntaxRules(): object[] {
        return ( new RuleBuilder() ).build( UI_PROPERTY_SYNTAX_RULES, DEFAULT_UI_PROPERTY_SYNTAX_RULE );
    }

}