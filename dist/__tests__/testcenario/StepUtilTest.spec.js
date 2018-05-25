"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StepUtil_1 = require("../../modules/testscenario/StepUtil");
const NodeTypes_1 = require("../../modules/req/NodeTypes");
const Entities_1 = require("../../modules/nlp/Entities");
const arrayMove = require("array-move");
const deepcopy = require("deepcopy");
const EnglishKeywordDictionary_1 = require("../../modules/dict/EnglishKeywordDictionary");
describe('StepUtilTest', () => {
    let util = null;
    let keywords = new EnglishKeywordDictionary_1.EnglishKeywordDictionary();
    beforeEach(() => {
        util = new StepUtil_1.StepUtil();
    });
    afterEach(() => {
        util = null;
    });
    it('does not move when there is nothing to move', () => {
        let steps = [
            { nodeType: NodeTypes_1.NodeTypes.STEP_GIVEN },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND },
            { nodeType: NodeTypes_1.NodeTypes.STEP_WHEN },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND },
            { nodeType: NodeTypes_1.NodeTypes.STEP_THEN },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND }
        ];
        const before = steps.slice(0); // as is
        steps = util.movePreconditionStepsToTheBeginning(steps, keywords);
        expect(steps).toEqual(before);
    });
    it('does not move when it does not have precondition', () => {
        let steps = [
            { nodeType: NodeTypes_1.NodeTypes.STEP_WHEN },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND },
            { nodeType: NodeTypes_1.NodeTypes.STEP_GIVEN },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND },
            { nodeType: NodeTypes_1.NodeTypes.STEP_THEN },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND }
        ];
        let expected = deepcopy(steps);
        let result = util.movePreconditionStepsToTheBeginning(steps, keywords);
        expect(result).toEqual(expected);
    });
    it('moves a GIVEN with a precondition and updates an AND that follows it to become a GIVEN', () => {
        let steps = [
            { nodeType: NodeTypes_1.NodeTypes.STEP_WHEN, values: ['a'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND, values: ['b'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND, values: ['c'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_GIVEN, values: ['d'], nlpResult: { entities: [{ entity: Entities_1.Entities.STATE, value: 'some state' }] } },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND, values: ['e'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND, values: ['f'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_THEN, values: ['g'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND, values: ['h'] }
        ];
        let expected = deepcopy(steps);
        // Move Given to the beginning
        expected = arrayMove(expected, 3, 0);
        // Change the next AND to become a GIVEN
        expected[4].nodeType = NodeTypes_1.NodeTypes.STEP_GIVEN;
        let result = util.movePreconditionStepsToTheBeginning(steps, keywords);
        expect(result).toEqual(expected);
    });
    it('moves an AND with a precondition and updates an AND that follows it to become a GIVEN', () => {
        let steps = [
            { nodeType: NodeTypes_1.NodeTypes.STEP_WHEN, values: ['a'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND, values: ['b'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND, values: ['c'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_GIVEN, values: ['d'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND, values: ['e'], nlpResult: { entities: [{ entity: Entities_1.Entities.STATE, value: 'some state' }] } },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND, values: ['f'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_THEN, values: ['g'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND, values: ['h'] }
        ];
        let expected = deepcopy(steps);
        // Make AND to become a GIVEN
        expected[4].nodeType = NodeTypes_1.NodeTypes.STEP_GIVEN;
        // Move it to the beginning
        expected = arrayMove(expected, 4, 0);
        // Change the next AND to become a GIVEN
        expected[5].nodeType = NodeTypes_1.NodeTypes.STEP_GIVEN;
        let result = util.movePreconditionStepsToTheBeginning(steps, keywords);
        expect(result).toEqual(expected);
    });
    it('moves after existing steps with preconditions', () => {
        let steps = [
            { nodeType: NodeTypes_1.NodeTypes.STEP_GIVEN, values: ['a'], nlpResult: { entities: [{ entity: Entities_1.Entities.STATE, value: 'foo' }] } },
            { nodeType: NodeTypes_1.NodeTypes.STEP_WHEN, values: ['b'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND, values: ['c'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND, values: ['d'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_GIVEN, values: ['e'], nlpResult: { entities: [{ entity: Entities_1.Entities.STATE, value: 'bar' }] } },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND, values: ['f'], nlpResult: { entities: [{ entity: Entities_1.Entities.STATE, value: 'baz' }] } },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND, values: ['g'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_THEN, values: ['h'] },
            { nodeType: NodeTypes_1.NodeTypes.STEP_AND, values: ['i'] }
        ];
        let expected = deepcopy(steps);
        // Move it to the second step
        expected = arrayMove(expected, 4, 1);
        // Change the next AND to become a GIVEN
        expected[5].nodeType = NodeTypes_1.NodeTypes.STEP_GIVEN;
        expected = arrayMove(expected, 5, 2);
        // Change the next AND to become a GIVEN
        expected[6].nodeType = NodeTypes_1.NodeTypes.STEP_GIVEN;
        let result = util.movePreconditionStepsToTheBeginning(steps, keywords);
        expect(result).toEqual(expected);
    });
});
