# Versionamento

A numeração de versões do projeto Concordia é baseada no [Versionamento Semântico](https://semver.org/lang/pt-BR/).

Apesar de o Versionamento Semântico ser concebido para [API](https://pt.wikipedia.org/wiki/Interface_de_programa%C3%A7%C3%A3o_de_aplica%C3%A7%C3%B5es)s e não para *Aplicações*, adotamos uma convenção muito similar. Dessa forma, mudanças se tornam previsíveis e você consegue saber, pela numeração, quando uma versão não é mais compatível com a versão anterior.

Dada uma versão `MAIOR`.`MENOR`.`ATUALIZAÇÃO`:
- A numeração de `MAIOR` é incrementada quando o **Compilador** ou a **Linguagem** deixam de ser compatíveis com a versão anterior.
- A numeração de `MENOR` é incrementada ao adicionar funcionalidade(s) mantendo a compatibilidade.
- A numeração de `ATUALIZAÇÃO` é incrementada quando há correções, pequena alterações, ou pequenas novidades, todas compatíveis com a versão anterior.

Exemplos:
- `0.2.0` é compatível com `0.1.0`
- `0.1.1` é compatível com `0.1.0`
- `1.0.0` *não* é compatível com `0.2.0`