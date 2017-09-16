import { NLPTrainingDataConversor } from "../../modules/nlp/NLPTrainingDataConversor";
import { NLPTrainingData, NLPTrainingSentence } from '../../modules/nlp/NLPTrainingData';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'NLPTrainingDataConversorTest', () => {

    let conversor: NLPTrainingDataConversor = new NLPTrainingDataConversor();

    it( 'converts correctly an object that is filled normally', () => {

        let map = {
            "intent1": {
                "entity1": {
                    "match1": [ "one", "two" ],
                    "match2": [ "three", "four", "five" ]
                },
                "entity2": {
                    "match3": [ "six" ]
                }
            },
            "intent2": {
                "entity3": {
                    "match4": [ "seven", "eight" ]
                },
                "entity4": {
                    "match5": [ "nine", "ten", "eleven" ],
                    "match6": [ "twelve" ]
                }
            }
        };

        let sentences = [
            new NLPTrainingSentence( "entity1", "whatever" ),
            new NLPTrainingSentence( "entity2", "something" )
        ];

        let data = conversor.convert( map, sentences );

        expect( data.intents ).toHaveLength( 2 );
        expect( data.documents ).toHaveLength( 2 );

        expect( data ).toEqual(
            {
                "intents": [
                    {
                        "name": "intent1",
                        "entities": [
                            {
                                "name": "entity1",
                                "matches": [
                                    {
                                        "id": "match1",
                                        "samples": [ "one", "two" ]
                                    },
                                    {
                                        "id": "match2",
                                        "samples": [ "three", "four", "five" ]
                                    }                                    
                                ]
                            },
                            {
                                "name": "entity2",
                                "matches": [
                                    {
                                        "id": "match3",
                                        "samples": [ "six" ]
                                    }                                    
                                ]
                            }                            
                        ]
                    },

                    {
                        "name": "intent2",
                        "entities": [
                            {
                                "name": "entity3",
                                "matches": [
                                    {
                                        "id": "match4",
                                        "samples": [ "seven", "eight" ]
                                    }                                   
                                ]
                            },
                            {
                                "name": "entity4",
                                "matches": [
                                    {
                                        "id": "match5",
                                        "samples": [ "nine", "ten", "eleven" ]
                                    },                                    
                                    {
                                        "id": "match6",
                                        "samples": [ "twelve" ]
                                    }                                    
                                ]
                            }                            
                        ]
                    }
                    
                ],

                "documents": [
                    { "entity": "entity1", "sentence": "whatever" },
                    { "entity": "entity2", "sentence": "something" }
                ]
            }
        );

    } );


    it( 'converts an empty object correctly', () => {
        let data = conversor.convert( {}, [] );
        expect( data.intents ).toHaveLength( 0 );
        expect( data.documents ).toHaveLength( 0 );        
    } );

} );