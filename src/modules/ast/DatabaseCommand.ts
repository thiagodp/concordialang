import { NamedNode } from './Node';

// DATABASE COMMAND
//
// Example 1:
// ```
//     - "matriculas-de-alunos" to "bdteste" as "SELECT matricula FROM aluno"
// ```
//
// Example 2:
// ```
//     - "senha-para-matricula-de-aluno" to "bdteste"
//        as "SELECT senha FROM aluno WHERE matricula = :matricula"
// ```
//
// Example 3:
// ```
//   - "disciplinas-do-periodo" to "bdteste"
//      as "SELECT nome, horarios, salas, professor, email FROM disciplina
//          WHERE periodo = {{periodo-matricula}}"
// ```
//
// Example 4:
// ```
//   - "disciplina-com-codigo" to "bdteste"
//     as "SELECT nome, horarios, salas, professor, email FROM disciplina
//         WHERE periodo = {{periodo-matricula}} AND codigo = :codigo"
// ```
//
// Notes:
//      {{ }} allows the use of a constant
//      :variable is a parameter for the command
//

export interface DatabaseCommand extends NamedNode {
    databaseName: string;    
    command: string;
    type: 'query' | 'command';
}