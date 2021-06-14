import { SyntacticException } from './SyntacticException';
import { TagCollector } from './TagCollector';
import { TextCollector } from './TextCollector';
/**
 * Feature parser
 *
 * @author Thiago Delgado Pinto
 */
export class FeatureParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks if it is already declared
        if (context.doc.feature) {
            let e = new SyntacticException('Just one feature declaration is allowed.', node.location);
            errors.push(e);
            return false;
        }
        // Define the current feature
        context.doc.feature = node;
        // Checks the structure
        node.tags = node.tags || [];
        node.sentences = node.sentences || [];
        node.scenarios = node.scenarios || [];
        node.uiElements = node.uiElements || [];
        // Adjust the context
        context.resetInValues();
        context.inFeature = true;
        // Add backwards tags
        (new TagCollector()).addBackwardTags(it, node.tags); // does not touch the iterator
        // Add forward text sentences
        (new TextCollector()).addForwardTextNodes(it, node.sentences, true); // true == change iterator
        return true;
    }
}
