import { VariantGenerator } from "../../modules/testcase/VariantGenerator";
import { Template } from "../../modules/ast/Variant";
import { DataTestCase } from "../../modules/data-gen/DataTestCase";

describe( 'VariantGeneratorTest', () => {

    let gen: VariantGenerator = new VariantGenerator();

    it( 'adds a name correctly', () => {
        let content = [];
        gen.addName( content, { name: 'Foo' } as Template, 'Variant', DataTestCase.VALUE_MIN );
        expect( content[ 0 ] ).toEqual( 'Variant: Foo - ' + DataTestCase.VALUE_MIN );
    } );

} );