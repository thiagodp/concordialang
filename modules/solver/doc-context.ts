import { Location } from 'concordialang-types';

import { Document } from '../ast';
import { LocatedException } from '../error';
import { AugmentedSpec } from '../req/AugmentedSpec';


export type DocContext = {
	doc: Document,
	spec: AugmentedSpec,
	errors: LocatedException[],
	location: Location,
};
