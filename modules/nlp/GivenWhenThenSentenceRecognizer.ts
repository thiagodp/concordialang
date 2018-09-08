import { NLPTrainer } from './NLPTrainer';
import { Intents } from './Intents';
import { NodeSentenceRecognizer, NLPResultProcessor } from "./NodeSentenceRecognizer";
import { LocatedException } from "../req/LocatedException";
import { ContentNode } from "../ast/Node";
import { NLP } from "./NLP";
import { NLPResult } from './NLPResult';
import { NLPException } from "./NLPException";
import { Entities } from "./Entities";
import { RuleBuilder } from './RuleBuilder';
import { UI_ACTION_SYNTAX_RULES, DEFAULT_UI_ACTION_SYNTAX_RULE } from './SyntaxRules';
import { Step } from '../ast/Step';

/**
 * Given-When-Then sentence recognizer.
 *
 * @author Thiago Delgado Pinto
 */
export class GivenWhenThenSentenceRecognizer {

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
     * @param ownerName Owner of the sentences.
     *
     * @throws Error If the NLP is not trained.
     */
    recognizeSentences(
        language: string,
        nodes: Step[],
        errors: LocatedException[],
        warnings: LocatedException[],
        ownerName: string = 'Variant'
    ) {
        const recognizer = new NodeSentenceRecognizer( this._nlp );
        const syntaxRules = this._syntaxRules;

        let processor: NLPResultProcessor = function(
            node: ContentNode,
            r: NLPResult,
            errors: LocatedException[],
            warnings: LocatedException[]
        ) {
            if ( ! r.entities || r.entities.length < 1 ) {
                const msg = 'Unrecognized entities in: ' + node.content;
                warnings.push( new NLPException( msg, node.location ) );
                return;
            }
            //console.log( 'Entities', r.entities );

            const recognizedEntityNames: string[] = r.entities.map( e => e.entity );

            // ACTION or EXEC ACTION
            const actionIndex: number = recognizedEntityNames.indexOf( Entities.UI_ACTION );
            const execActionIndex: number = recognizedEntityNames.indexOf( Entities.EXEC_ACTION );
            if ( actionIndex < 0 && execActionIndex < 0 ) {
                const msg = 'Unrecognized action in: ' + node.content;
                warnings.push( new NLPException( msg, node.location ) );
                return;
            }

            let action: string;
            if ( actionIndex >= 0 ) {
                action = r.entities[ actionIndex ].value;
                // validate the action
                recognizer.validate( node, recognizedEntityNames, syntaxRules, action, errors, warnings );
            } else if ( execActionIndex > 0 ) {
                action = r.entities[ execActionIndex ].value;
            }

            let item: Step = node as Step;

            // action
            item.action = action;

            // modifier (optional)
            const modifiers = r.entities.filter( e => e.entity === Entities.UI_ACTION_MODIFIER ).map( e => e.value );
            if ( modifiers.length > 0 ) {
                item.actionModifier = modifiers[ 0 ];
            }

            // options (optional)
            const options = r.entities.filter( e => e.entity === Entities.UI_ACTION_OPTION ).map( e => e.value );
            if ( options.length > 0 ) {
                item.actionOptions = options;
            }

            // targets - UI LITERALS (optional)
            item.targets = r.entities.filter( e => e.entity === Entities.UI_LITERAL ).map( e => e.value );

            // target types
            item.targetTypes = r.entities.filter( e => e.entity === Entities.UI_ELEMENT_TYPE ).map( e => e.value );

            // values (optional)
            item.values = r.entities
                .filter( e => e.entity === Entities.VALUE || e.entity === Entities.NUMBER )
                .map( e => e.value );

            // commands as values (optional)
            let commands: string[] = r.entities.filter( e => e.entity === Entities.COMMAND )
                .map( e => e.value.toString() );
            for ( let cmd of commands ) {
                ( item.values as string[] ).push( cmd );
            }

        };


        recognizer.recognize(
            language,
            nodes,
            [ Intents.TEST_CASE ],
            ownerName,
            errors,
            warnings,
            processor
        );
    }


    public buildSyntaxRules(): object[] {
        return ( new RuleBuilder() ).build( UI_ACTION_SYNTAX_RULES, DEFAULT_UI_ACTION_SYNTAX_RULE );
    }

}