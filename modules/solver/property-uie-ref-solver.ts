import { EntityValue, UIElement } from '../ast';
import { PropCfg, UIEPropertyCache } from '../testdata/dtc/prop-cfg';


export function solveUIEInProperty(
	propEntity: EntityValue,
	propertyCache: UIEPropertyCache
): any {

	const refUIE = propEntity.references[ 0 ] as UIElement;
	if ( ! refUIE?.info?.fullVariableName ) {
		// TO-DO: show error "ui element not found"
		return null;
	}

	const propCfg: PropCfg = propertyCache.get( refUIE.info.fullVariableName );
	if ( propCfg?.value ) { // Is the value in cache?
		return propCfg.value.value; // Returns it
	}

	if ( propCfg.editable && ! propCfg.editable.value ) {
		// TO-DO: show error "ui element is not editable to generate value"
		return null;
	}

	// This situation should not happen to a UI_ELEMENT_REF,
	// since UIEs are sorted in topological order.
	//
	// TO-DO: log it
	//
	// Continue to value generation...

	// TO-DO: Generate the value

}
