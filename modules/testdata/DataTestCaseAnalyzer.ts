import { Document } from "../ast/Document";
import { Spec } from "../ast/Spec";
import { DataTestCase } from "./DataTestCase";
import { DocumentUtil, UIElementInfo } from "../util/DocumentUtil";
import { UIElement } from "../ast/UIElement";
import { NLPUtil, NLPEntity } from "../nlp/NLPResult";
import { UIElementPropertyExtractor } from "../util/UIElementPropertyExtractor";

export class DataTestCaseAnalyzer {

    private readonly _docUtil = new DocumentUtil();
    private readonly _uiePropExtractor = new UIElementPropertyExtractor();
    private readonly _nlpUtil = new NLPUtil();

    compatibleDataTestCases(
        uiElementVariable: string,
        doc: Document,
        spec: Spec,
        errors: Error[]
    ): DataTestCase[] {

        let info: UIElementInfo | null = null;

        // Finds in the document
        let uie: UIElement | null = this._docUtil.findUIElementInTheDocument( uiElementVariable, doc );

        // If not found, find in the spec
        if ( ! uie ) {
            info = spec.uiElementsVariableMap().get( uiElementVariable );
            // Not found in the spec, register an error
            if ( ! info ) {
                const msg = `UI Element not found in the specification: ${uiElementVariable}`;
                errors.push( new Error( msg ) );
                return [];
            }
            uie = info.uiElement;
        } else {
            info = new UIElementInfo( doc, uie, null, doc.feature || null );
        }

        // Non editable UI Element
        if ( ! this._uiePropExtractor.extractIsEditable( uie ) ) {
            return [];
        }

        // Let's analyze the data type of the UI Element
        const dataType: string = this._uiePropExtractor.extractDataType( uie );
        //...


        return [];
    }

}