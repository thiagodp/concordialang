import { FileInfo } from '../../../modules/ast/FileInfo';
import { FileProblemMapper } from '../../../modules/error/FileProblemMapper';
import { AugmentedSpec } from '../../../modules/req/AugmentedSpec';
import { SpecFilter } from '../../../modules/selection/SpecFilter';
import { BatchSpecificationAnalyzer } from '../../../modules/semantic/BatchSpecificationAnalyzer';
import { dependenciesOfUIElements, sortUIElementsByTheirDependencies } from '../../../modules/testdata/dtc/uie-sorting';
import { SimpleCompiler } from '../../SimpleCompiler';

describe( 'uie-sorting', () => {

    const LANGUAGE = 'pt';
    let cp: SimpleCompiler;
    let bsa: BatchSpecificationAnalyzer;
    let spec: AugmentedSpec;

    beforeEach( () => {
        cp = new SimpleCompiler( LANGUAGE );
        bsa = new BatchSpecificationAnalyzer();
        spec = new AugmentedSpec();
    } );

    afterEach( () => {
        spec = null;
        cp = null;
        bsa = null;
    } );


    describe( 'dependenciesOfUIElements', () => {

        it( 'single dependency from a query', async () => {

            const doc1 = await cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor em "SELECT x FROM [Minha Tabela] WHERE y = {bar}"',
                    'UI Element: bar',
                    ' - valor é "twenty"',
                    'Tabela: Minha Tabela',
                    '| x   | y      |',
                    '| 10  | ten    |',
                    '| 20  | twenty |',
                ],
                { } as FileInfo
            );

            await bsa.analyze( new FileProblemMapper(), spec, new SpecFilter( spec ).graph() );

            // console.log( doc1 );

            const [ foo, bar ] = doc1.feature.uiElements;

            const elements = dependenciesOfUIElements( foo );
            expect( elements ).toHaveLength( 1 );
            expect( elements[ 0 ].name ).toEqual( bar.name );
        } );


        it( 'single dependency from a direct reference', async () => {

            const doc1 = await cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor é igual a {bar}',
                    'UI Element: bar',
                    ' - valor é "twenty"'
                ],
                { } as FileInfo
            );

            await bsa.analyze( new FileProblemMapper(), spec, new SpecFilter( spec ).graph() );

            // console.log( doc1 );

            const [ foo, bar ] = doc1.feature.uiElements;

            const elements = dependenciesOfUIElements( foo );
            expect( elements ).toHaveLength( 1 );
            expect( elements[ 0 ].name ).toEqual( bar.name );
        } );


        it( 'two dependencies from a direct reference and query', async () => {

            const doc1 = await cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor mínimo é igual a {bar}',
                    ' - valor máximo é igual a "SELECT x FROM [MinhaTabela] WHERE x = {zoo}"',
                    'UI Element: bar',
                    ' - valor é "twenty"',
                    'UI Element: zoo',
                    ' - valor é 20',
                    'Tabela: Minha Tabela',
                    '| x   | y      |',
                    '| 10  | ten    |',
                    '| 20  | twenty |',
                ],
                { } as FileInfo
            );

            await bsa.analyze( new FileProblemMapper(), spec, new SpecFilter( spec ).graph() );

            // console.log( doc1 );

            const [ foo, bar, zoo ] = doc1.feature.uiElements;

            const elements = dependenciesOfUIElements( foo );
            expect( elements ).toHaveLength( 2 );

            expect( elements[ 0 ].name ).toEqual( bar.name );
            expect( elements[ 1 ].name ).toEqual( zoo.name );
        } );


        it( 'detects a dependency from another element that depends on a queried value', async () => {

            const doc1 = await cp.addToSpec(
                spec,
                [
                    'Feature: L',
                    'UI Element: Usuario',
                    ' - valor é igual a "SELECT usuario FROM [Usuarios]"',
                    'UI Element: Senha',
                    ' - valor é igual a "SELECT senha FROM [Usuarios] WHERE usuario = {Usuario}"',
                    'Tabela: Usuarios',
                    '| usuario  | senha    |',
                    '| bob      | bob123   |',
                    '| alice    | alice456 |',
                ],
                { } as FileInfo
            );

            await bsa.analyze( new FileProblemMapper(), spec, new SpecFilter( spec ).graph() );

            const [ usuario, senha ] = doc1.feature.uiElements;
            const elements = dependenciesOfUIElements( senha );
            expect( elements ).toHaveLength( 1 );
            expect( elements[ 0 ].name ).toEqual( usuario.name );
        } );

    } );




    describe( 'sortUIElementsByTheirDependencies', () => {

        it( 'works', async () => {
            const doc1 = await cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor mínimo é igual a {bar}',
                    ' - valor máximo é igual a "SELECT x FROM [MinhaTabela] WHERE x = {zoo}"',
                    'UI Element: bar',
                    ' - valor é "twenty"',
                    'UI Element: zoo',
                    ' - valor é 20',
                    'Tabela: Minha Tabela',
                    '| x   | y      |',
                    '| 10  | ten    |',
                    '| 20  | twenty |',
                ],
                { } as FileInfo
            );

            await bsa.analyze( new FileProblemMapper(), spec, new SpecFilter( spec ).graph() );

            // console.log( doc1 );

            const [ foo, bar, zoo ] = doc1.feature.uiElements;

            const problems = [];
            const elements = sortUIElementsByTheirDependencies( doc1.feature.uiElements, problems );
            expect( problems ).toHaveLength( 0 );
            expect( elements ).toHaveLength( 3 );
            expect( elements[ 0 ].name ).toEqual( bar.name );
            expect( elements[ 1 ].name ).toEqual( zoo.name );
            expect( elements[ 2 ].name ).toEqual( foo.name );
        } );



        it( 'detects cycles', async () => {
            const doc1 = await cp.addToSpec(
                spec,
                [
                    'Feature: A',
                    'UI Element: foo',
                    ' - valor mínimo é igual a {bar}',
                    ' - valor máximo é igual a "SELECT x FROM [MinhaTabela] WHERE x = {zoo}"',
                    'UI Element: bar',
                    ' - valor é "twenty"',
                    'UI Element: zoo',
                    ' - valor é igual à {foo}', // cycle
                    'Tabela: Minha Tabela',
                    '| x   | y      |',
                    '| 10  | ten    |',
                    '| 20  | twenty |',
                ],
                { } as FileInfo
            );

            await bsa.analyze( new FileProblemMapper(), spec, new SpecFilter( spec ).graph() );

            // console.log( doc1 );

            const problems = [];
            const elements = sortUIElementsByTheirDependencies( doc1.feature.uiElements, problems );
            expect( problems ).toHaveLength( 1 );
        } );

    } );


} );
