# ♺ Ciclo de uso recomendado

1. Escreva ou atualize sua especificação de requisitos com a *Linguagem Concordia* e valide-a com usuários ou interessados;

2. Use o **Compilador Concordia** para gerar testes a partir da especificação e os execute;

3. Se os testes **falharam**, há algumas possibilidades, como:

   1. Você não implementou o comportamento correspondente na sua aplicação. Nesse caso, basta implementar e executar os testes novamente.

   2. Sua aplicação está se comportando diferente do especificado. Nesse caso, ela pode ter bugs ou pode ser que você, ou sua equipe, não tenham implementado o compartamento exatamente como descrito na especificação.

      - Se ela tem um bug, ficamos felizes em tê-lo descoberto! Corrija-o e execute os testes novamente, para ter certeza que ele se foi.

      - Caso contrário, você pode decidir em **alterar a sua aplicação** para se comportar exatamente como havia sido especificado, ou **alterar a especificação** para casar com o comportamento da sua aplicação. No último caso, volte ao passo `1`.

4. Se os testes **passaram**, *bom trabalho!* Agora você pode escrever novos requisitos or adicionar mais casos testes. Nesse caso, basta voltar ao passo `1`.
