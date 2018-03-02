import { NLPTrainer } from './NLPTrainer';
import { Intents } from './Intents';
import { NodeSentenceRecognizer, NLPResultProcessor } from "./NodeSentenceRecognizer";
import { LocatedException } from "../req/LocatedException";
import { ContentNode } from "../ast/Node";
import { NLP } from "./NLP";
import { NLPResult } from '../../modules/nlp/NLPResult';
import { NLPException } from "./NLPException";
import { Entities } from "./Entities";
import { Warning } from "../req/Warning";
import { RuleBuilder } from './RuleBuilder';
import { UI_ACTION_SYNTAX_RULES, DEFAULT_UI_ACTION_SYNTAX_RULE } from './SyntaxRules';
import { Step } from '../ast/Step';
import { filter } from 'minimatch';

/**
 * Variant sentence recognizer.
 * 
 * @author Thiago Delgado Pinto
 */
export class VariantSentenceRecognizer {

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
        return trainer.trainNLP( this._nlp, language, Intents.TEST_CASE );
    }

    /**
     * Recognize sentences using NLP.
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
        nodes: Step[],
        errors: LocatedException[],
        warnings: LocatedException[],
        variantName: string = 'Variant'
    ) {
        const recognizer = new NodeSentenceRecognizer( this._nlp );
        const syntaxRules = this._syntaxRules;

        let processor: NLPResultProcessor = function(
            node: ContentNode,
            r: NLPResult,
            errors: LocatedException[],
            warnings: LocatedException[]
        ) {
            if ( r.entities.length < 1 ) {
                const msg = 'Unrecognized: ' + node.content;
                warnings.push( new NLPException( msg, node.location ) );
                return;
            }
            //console.log( 'Entities', r.entities );

            const recognizedEntityNames: string[] = r.entities.map( e => e.entity );

            // ACTION (mandatory?, what about a state?)
            const actionIndex: number = recognizedEntityNames.indexOf( Entities.UI_ACTION );
            if ( actionIndex < 0 ) {
                const msg = 'Unrecognized: ' + node.content;
                warnings.push( new NLPException( msg, node.location ) );
                return;
            }
            const action: string = r.entities[ actionIndex ].value;
            // validate the action
            recognizer.validate( node, recognizedEntityNames, syntaxRules, action, errors, warnings );

            let item: Step = node as Step;
            item.action = action;

            // ELEMENTS (optional)
            item.targets = r.entities.filter( e => e.entity === Entities.UI_ELEMENT ).map( e => e.value );
            
            // VALUES (optional)
            item.values = r.entities
                .filter( e => e.entity === Entities.VALUE || e.entity === Entities.NUMBER )
                .map( e => e.value );
        };


        recognizer.recognize(
            language,
            nodes,
            [ Intents.TEST_CASE ],
            variantName,
            errors,
            warnings,
            processor
        );
    }


    public buildSyntaxRules(): object[] {
        return ( new RuleBuilder() ).build( UI_ACTION_SYNTAX_RULES, DEFAULT_UI_ACTION_SYNTAX_RULE );
    }    

}