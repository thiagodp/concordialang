import { Lexer } from '../alt-lexer/Lexer';
import { LexerException } from '../alt-lexer/LexerException';
import { ParserException } from './ParserException';
import { FeatureNode } from "../ast/FeatureNode";
import { Node } from "../ast/Node";
import { TokenTypes } from "../alt-lexer/TokenTypes";

/**
 * Parser
 * 
 * @author Thiago Delgado Pinto
 */
export class Parser {

    private _input: string;
    private _file: string;
    private _tags: string[];
    private _languageSpecifierLine: number;

    constructor( private _lexer: Lexer ) {
    }

    /**
     * Parses input and returns a feature node.
     * 
     * @param input Input string
     * @param language Language used in the specification.
     * @param fileName File name.
     * @returns FeatureNode
     */
    public parse( input: string, language: string = 'en', fileName: string = null ) {

        // Reset 
        this._input = input;
        this._file = fileName;
        this._tags = [];
        this._languageSpecifierLine = 0;

        // Analyze with the lexer
        try {
            this._lexer.analyze( input, language );
        } catch ( e ) {
            if ( e instanceof LexerException ) {
                throw new ParserException(
                    'Lexer exception "' + e.message + '" thrown for file "' + ( fileName || '' ) + '".',
                    e.location );
            }
            throw e;
        }

        return this.parseInput();
    }

    protected parseInput(): FeatureNode {
        let feature: FeatureNode = null;
        let predictedType: string;
        let node: Node;
        while ( TokenTypes.EOC !== ( predictedType = this.predictTokenType() )  ) {
            
            node = this.parseExpression();
            if ( null === node ) {
                continue;
            }

            if ( TokenTypes.FEATURE === node.tokenType() ) {
                if ( feature ) {
                    throw new ParserException(
                        'Only one feature is allowed per feature file. But "' + this._file + '" got multiple.',
                        node.location()
                    );
                } else {
                    feature = node as FeatureNode;
                }
            }


        }
        return feature;
    }

    protected predictTokenType(): string {
        return null;
    }

    protected parseExpression(): Node {
        return null;
    }

}