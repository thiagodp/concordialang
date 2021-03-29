import { Document } from '../../ast/Document';
import { UIElement } from '../../ast/UIElement';
import { EntityValueType, UIProperty } from '../../ast/UIProperty';
import { DataTestCase } from '../DataTestCase';
import { UIElementValueGenerator } from '../UIElementValueGenerator';
import { Cfg } from './Cfg';
import { ExpectedResult } from './ExpectedResult';

// Map all UI Elements (and UI Literals?)
// Establish dependency order, based on Scenarios and UI Elements' references



class ResolvedUIE {
	value: EntityValueType;
	cfg: Cfg
}


function resolveUIE(
	uie: UIElement,
	uieValueGen: UIElementValueGenerator
): ResolvedUIE {
	const cfg = new Cfg();

	return null;
}

function resolveProperty( uip: UIProperty ): void {

}

type UIERefToUIE = Map< string, UIElement >;
type UIERefToCfg = Map< string, Cfg >; // variable name to cfg
type DTCMap = Map< DataTestCase, ExpectedResult >;
type UIERefToDTCMap = Map< string, DTCMap >;


function generate( uie: UIElement, doc: Document, uieRefToUIEMap: UIERefToUIE ) {

	const name = makeFullVariableName( doc, uie );

	// analisar e reutilizar coisas q já foram feitas...

	// const propertyCfg = propertiesOf( name, );
	// const cfg = makeConfig( propertyCfg );
	// const dtcMap = evaluateDataTestCases( cfg );

}

function makeFullVariableName( doc: Document, uie: UIElement ): string {
	return ''; // TODO:
}

// =============================================================================
// Resolução de PROPRIEDADES dos UIE (vem primeiro)
// Há PROPRIEDADES que dependem de VALOR GERADO de outros UIE.
// Um VALOR GERADO depende de uma DTC.
// Algumas DTC dependem de PROPRIEDADES.
// =============================================================================
// Conjunto de possíveis DTCs devem ser atreladas à geração do cenário. A
// combinação faz parte da construção do resultado, independente do algoritmo.




