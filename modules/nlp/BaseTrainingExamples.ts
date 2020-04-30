import { NLPTrainingIntentExample } from "./NLPTrainingData";

export const BASE_TRAINING_EXAMPLES: NLPTrainingIntentExample[] = [

    {
        "intent": "testcase",
        "sentences": [

            "{ui_action} {ui_element}",
            "{ui_action} {ui_literal}",
            "{ui_action} {value}",
            "{ui_action} {number}",
            "{ui_action} {constant}",
            "{ui_action} {ui_property_ref}",
            "{ui_action} {state}",

            "{ui_action} {ui_element} {value}",
            "{ui_action} {ui_element} {number}",
            "{ui_action} {ui_element} {constant}",
            "{ui_action} {ui_element} {ui_property_ref}",
            "{ui_action} {ui_element} {ui_action_option}",
            "{ui_action} {ui_element} {ui_action_option} {value}",
            "{ui_action} {ui_element} {ui_action_option} {value} {value}",
            "{ui_action} {ui_element} {ui_action_option} {value} {number}",
            "{ui_action} {ui_element} {ui_action_option} {value} {constant}",
            "{ui_action} {ui_element} {ui_action_option} {value} {ui_action_option} {value}",
            "{ui_action} {ui_element} {ui_action_option} {value} {ui_action_option} {number}",
            "{ui_action} {ui_element} {ui_action_option} {value} {ui_action_option} {constant}",
            "{ui_action} {ui_element} {ui_action_option} {ui_element}",
            "{ui_action} {ui_element} {ui_action_option} {ui_literal}",
            "{ui_action} {ui_element} {ui_action_option} {ui_action_option} {value}",
            "{ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {value}",
            "{ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {number}",
            "{ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {constant}",
            "{ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {ui_action_option} {value}",
            "{ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {ui_action_option} {number}",
            "{ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {ui_action_option} {constant}",


            "{ui_action} {ui_action_option} {value} {ui_element}",
            "{ui_action} {ui_action_option} {value} {ui_element} {value}",
            "{ui_action} {ui_action_option} {value} {ui_element} {number}",
            "{ui_action} {ui_action_option} {value} {ui_element} {constant}",
            "{ui_action} {ui_action_option} {value} {ui_element} {ui_action_option} {value}",
            "{ui_action} {ui_action_option} {value} {ui_element} {ui_action_option} {number}",
            "{ui_action} {ui_action_option} {value} {ui_element} {ui_action_option} {constant}",

            "{ui_action} {ui_action_option} {number} {ui_element}",
            "{ui_action} {ui_action_option} {number} {ui_element} {value}",
            "{ui_action} {ui_action_option} {number} {ui_element} {number}",
            "{ui_action} {ui_action_option} {number} {ui_element} {constant}",
            "{ui_action} {ui_action_option} {number} {ui_element} {ui_action_option} {value}",
            "{ui_action} {ui_action_option} {number} {ui_element} {ui_action_option} {number}",
            "{ui_action} {ui_action_option} {number} {ui_element} {ui_action_option} {constant}",

            "{ui_action} {ui_action_option} {constant} {ui_element}",
            "{ui_action} {ui_action_option} {constant} {ui_element} {value}",
            "{ui_action} {ui_action_option} {constant} {ui_element} {number}",
            "{ui_action} {ui_action_option} {constant} {ui_element} {constant}",
            "{ui_action} {ui_action_option} {constant} {ui_element} {ui_action_option} {value}",
            "{ui_action} {ui_action_option} {constant} {ui_element} {ui_action_option} {number}",
            "{ui_action} {ui_action_option} {constant} {ui_element} {ui_action_option} {constant}",

            "{ui_action} {ui_action_option} {ui_element} {ui_action_option} {ui_element}",
            "{ui_action} {ui_action_option} {ui_element} {ui_action_option} {ui_element} {ui_action_option} {ui_element}",
            "{ui_action} {ui_action_option} {ui_element} {ui_action_option} {ui_element} {ui_action_option} {ui_literal}",
            "{ui_action} {ui_action_option} {ui_element} {ui_action_option} {ui_literal} {ui_action_option} {ui_literal}",
            "{ui_action} {ui_action_option} {ui_element} {ui_action_option} {ui_literal}",
            "{ui_action} {ui_action_option} {ui_literal} {ui_action_option} {ui_literal}",
            "{ui_action} {ui_action_option} {ui_literal} {ui_action_option} {ui_literal} {ui_action_option} {ui_literal}",
            "{ui_action} {ui_action_option} {ui_literal} {ui_action_option} {ui_literal} {ui_action_option} {ui_element}",
            "{ui_action} {ui_action_option} {ui_literal} {ui_action_option} {ui_element} {ui_action_option} {ui_element}",

            "{ui_action} {value} {ui_element}",
            "{ui_action} {number} {ui_element}",
            "{ui_action} {constant} {ui_element}",
            "{ui_action} {ui_property_ref} {ui_element}",

            "{ui_action} {ui_literal} {value}",
            "{ui_action} {ui_literal} {number}",
            "{ui_action} {ui_literal} {constant}",
            "{ui_action} {ui_literal} {ui_property_ref}",
            "{ui_action} {ui_literal} {ui_action_option}",
            "{ui_action} {ui_literal} {ui_action_option} {ui_element}",
            "{ui_action} {ui_literal} {ui_action_option} {ui_literal}",

            "{ui_action} {value} {ui_literal}",
            "{ui_action} {number} {ui_literal}",
            "{ui_action} {constant} {ui_literal}",
            "{ui_action} {ui_property_ref} {ui_literal}",

            "{ui_action} {value} {ui_literal} {ui_action_option}",
            "{ui_action} {number} {ui_literal} {ui_action_option}",
            "{ui_action} {constant} {ui_literal} {ui_action_option}",
            "{ui_action} {ui_property_ref} {ui_literal} {ui_action_option}",

            "{ui_action} {ui_element_type} {value}",
            "{ui_action} {ui_element_type} {number}",
            "{ui_action} {ui_element_type} {constant}",
            "{ui_action} {ui_element_type} {ui_property_ref}",

            "{ui_action} {ui_element_type} {ui_property} {value}",
            "{ui_action} {ui_element_type} {ui_property} {number}",
            "{ui_action} {ui_element_type} {ui_property} {constant}",
            "{ui_action} {ui_element_type} {ui_property} {ui_property_ref}",

            "{ui_action} {value} {ui_element_type}",
            "{ui_action} {number} {ui_element_type}",
            "{ui_action} {constant} {ui_element_type}",
            "{ui_action} {ui_property_ref} {ui_element_type}",

            "{ui_action} {ui_element_type} {ui_element}",
            "{ui_action} {ui_element_type} {ui_element} {value}",
            "{ui_action} {ui_element_type} {ui_element} {number}",
            "{ui_action} {ui_element_type} {ui_element} {constant}",
            "{ui_action} {ui_element_type} {ui_element} {ui_property_ref}",

            "{ui_action} {value} {ui_element_type} {ui_element}",
            "{ui_action} {number} {ui_element_type} {ui_element}",
            "{ui_action} {constant} {ui_element_type} {ui_element}",
            "{ui_action} {ui_property_ref} {ui_element_type} {ui_element}",

            "{ui_action} {ui_element_type} {ui_literal}",
            "{ui_action} {ui_element_type} {ui_literal} {value}",
            "{ui_action} {ui_element_type} {ui_literal} {number}",
            "{ui_action} {ui_element_type} {ui_literal} {constant}",
            "{ui_action} {ui_element_type} {ui_literal} {ui_property_ref}",

            "{ui_action} {value} {ui_element_type} {ui_literal}",
            "{ui_action} {number} {ui_element_type} {ui_literal}",
            "{ui_action} {constant} {ui_element_type} {ui_literal}",
            "{ui_action} {ui_property_ref} {ui_element_type} {ui_literal}",

            "{ui_action_modifier} {ui_action} {ui_element}",
            "{ui_action_modifier} {ui_action} {ui_element} {value}",
            "{ui_action_modifier} {ui_action} {ui_element} {number}",
            "{ui_action_modifier} {ui_action} {ui_element} {constant}",
            "{ui_action_modifier} {ui_action} {ui_element} {ui_property_ref}",

            "{ui_action_modifier} {ui_action} {value} {ui_element}",
            "{ui_action_modifier} {ui_action} {number} {ui_element}",
            "{ui_action_modifier} {ui_action} {constant} {ui_element}",
            "{ui_action_modifier} {ui_property_ref} {constant} {ui_element}",

            "{ui_action_modifier} {ui_action} {ui_literal}",
            "{ui_action_modifier} {ui_action} {ui_literal} {value}",
            "{ui_action_modifier} {ui_action} {ui_literal} {number}",
            "{ui_action_modifier} {ui_action} {ui_literal} {constant}",
            "{ui_action_modifier} {ui_action} {ui_literal} {ui_property_ref}",

            "{ui_action_modifier} {ui_action} {value} {ui_literal}",
            "{ui_action_modifier} {ui_action} {number} {ui_literal}",
            "{ui_action_modifier} {ui_action} {constant} {ui_literal}",
            "{ui_action_modifier} {ui_action} {ui_property_ref} {ui_literal}",

            "{ui_action_modifier} {ui_action} {ui_element_type}",
            "{ui_action_modifier} {ui_action} {ui_element_type} {value}",
            "{ui_action_modifier} {ui_action} {ui_element_type} {number}",
            "{ui_action_modifier} {ui_action} {ui_element_type} {constant}",
            "{ui_action_modifier} {ui_action} {ui_element_type} {ui_property_ref}",

            "{ui_action_modifier} {ui_action} {value} {ui_element_type}",
            "{ui_action_modifier} {ui_action} {number} {ui_element_type}",
            "{ui_action_modifier} {ui_action} {constant} {ui_element_type}",
            "{ui_action_modifier} {ui_action} {ui_property_ref} {ui_element_type}",
            "{ui_action_modifier} {ui_action} {ui_element_type} {ui_property} {value}",
            "{ui_action_modifier} {ui_action} {ui_element_type} {ui_property} {number}",
            "{ui_action_modifier} {ui_action} {ui_element_type} {ui_property} {constant}",
            "{ui_action_modifier} {ui_action} {ui_element_type} {ui_property} {ui_property_ref}",

            "{ui_action_modifier} {ui_action} {ui_action_option} {value}",
            "{ui_action_modifier} {ui_action} {ui_action_option} {number}",
            "{ui_action_modifier} {ui_action} {ui_action_option} {constant}",
            "{ui_action_modifier} {ui_action} {ui_action_option} {ui_property_ref}",
            "{ui_action_modifier} {ui_action} {ui_action_option} {ui_action_option} {value}",
            "{ui_action_modifier} {ui_action} {ui_action_option} {ui_action_option} {number}",
            "{ui_action_modifier} {ui_action} {ui_action_option} {ui_action_option} {constant}",
            "{ui_action_modifier} {ui_action} {ui_action_option} {ui_action_option} {ui_property_ref}",

            "{ui_action_modifier} {ui_action} {ui_element_type} {ui_action_option} {value}",
            "{ui_action_modifier} {ui_action} {ui_element_type} {ui_action_option} {number}",
            "{ui_action_modifier} {ui_action} {ui_element_type} {ui_action_option} {constant}",
            "{ui_action_modifier} {ui_action} {ui_element_type} {ui_action_option} {ui_property_ref}",

            "{ui_action_modifier} {ui_action} {ui_element} {ui_action_option} {ui_action_option} {value}",
            "{ui_action_modifier} {ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {value}",
            "{ui_action_modifier} {ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {number}",
            "{ui_action_modifier} {ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {constant}",
            "{ui_action_modifier} {ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {ui_action_option} {value}",
            "{ui_action_modifier} {ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {ui_action_option} {number}",
            "{ui_action_modifier} {ui_action} {ui_element} {ui_action_option} {ui_action_option} {value} {ui_action_option} {constant}",

            "{ui_action_modifier} {ui_action} {value} {ui_action_option}",
            "{ui_action_modifier} {ui_action} {number} {ui_action_option}",
            "{ui_action_modifier} {ui_action} {constant} {ui_action_option}",
            "{ui_action_modifier} {ui_action} {ui_property_ref} {ui_action_option}",

            "{exec_action} {state}",

            "{ui_action} {ui_action_option} {command}",

            // "eu não vejo a url com {value}"
        ]
    },

    {
        "intent": "ui",
        "sentences": [
            "{ui_property} {ui_connector} {value}",
            "{ui_property} {ui_connector} {number}",
            "{ui_property} {ui_connector} {constant}",
            "{ui_property} {ui_connector} {value_list}",
            "{ui_property} {ui_connector} {ui_data_type}",
            "{ui_property} {ui_connector} {ui_element_type}",
            "{ui_property} {ui_connector} {query}",

            "{ui_property} {ui_connector} {time}",
            "{ui_property} {ui_connector} {date}",
            "{ui_property} {ui_connector} {time_period}",

            // "id é {value}",
            // "comprimento máximo é {number}",
            // "valor vem da consulta {query}",
            // "tipo é {ui_element_type}",
            // "tipo é botão"
        ]
    },

    {
        "intent": "ui_item_query",
        "sentences": [
            "{ui_property} {query}",
            // "{ui_property} vem de {query}",
            // "{ui_property} vem da consulta {query}",
            // "{ui_property} vem da query {query}",
            // "{ui_property} está em {query}",
            // "{ui_property} está contido em {query}",
            // "{ui_property} está presente em {query}"
        ]
    },

    {
        "intent": "database",
        "sentences": [
            "{db_property} {ui_connector} {value}",
            "{db_property} {ui_connector} {number}",
            // "caminho é {value}",
            // "nome é {value}",
            // "tipo é {value}",
            // "porta é {number}"
        ]
    }

];