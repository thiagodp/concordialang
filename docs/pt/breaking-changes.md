# Quebras de Compatibilidade <!-- omit in toc -->

Antes de ler, pode ser útil entender [como o projeto Concordia numera suas versões](versioning.md).

- [Versão `0.x` para `1.x`](#vers%C3%A3o-0x-para-1x)
  - [O que quebrou a compatibilidade?](#o-que-quebrou-a-compatibilidade)
    - [Compilador Concordia](#compilador-concordia)
    - [Linguagem Concordia](#linguagem-concordia)
    - [Outras mudanças relevantes](#outras-mudan%C3%A7as-relevantes)
  - [FAQ](#faq)
  - [Como migrar](#como-migrar)

## Versão `0.x` para `1.x`

### O que quebrou a compatibilidade?

#### Compilador Concordia

1. Mudou a forma como ele realiza todas as operações com plug-ins. Veja a [Issue #34](https://github.com/thiagodp/concordialang/issues/34) para detalhes.
2. O comportamento dos seguintes comandos de plug-in:

| COMANDO          | AGORA | ANTES |
| ---------------- | ----- | ----- |
| `plugin-list`    | Lista os plug-ins **instalados para a aplicação**. | Listava todos os plug-ins **disponíveis** para uso. |
| `plugin-install` | Instala um **plug-in e suas dependências** | Instalava **apenas as dependências** do plug-in, uma vez que o plug-in vinha embutido no compilador. |
| `plugin-uninstall` | Desinstala um **plug-in e suas dependências** | Desinstalava **apenas as dependências** do plug-in, uma vez que ele vinha embutido no compilador. |
| `plugin-info` | Mostra informações sobre um plug-in **instalado para a aplicação**. | Mostrava informações sobre um plugin **disponível** no compilador. |
| `plugin-serve` | Inicia o servidor de testes de um plug-in **instalado para a aplicação**. |  Iniciava o servidor de testes de um plug-in **disponível** no compilador. |

👉 Consulte a [Documentação dos Comandos](./commands.md) para saber a sintaxe dos comandos acima.


#### Linguagem Concordia

Nenhuma quebra de compatibilidade.

#### Outras mudanças relevantes

Ferramentas externas utilizadas por plug-ins agora são instaladas de forma local, para o projeto, em vez de instaladas de forma global. A execução direta delas (sem usar o Concordia) passa a ser realizada através do NPX.  Por exemplo, quem antes executava `codeceptjs run teste.js`, deve passar a executar `npx codeceptjs run teste.js`. Essa novidade também possibilita usar versões diferentes das ferramentas externas, caso necessário.

### FAQ

1. *Mudou a sintaxe de algum comando?*

    Não, todos os comandos permanecem com a mesma sintaxe.

2. *O arquivo de configuração do meu projeto continua compatível?*

    Depende. Todas as propriedades, exceto `"plugin"`, continuam compatíveis. Se seu arquivo tem essa propriedade, recomendamos [atualizá-lo](./migration.md).

3. *Agora também é possível instalar ou desinstalar plug-ins com o NPM ?*

    Sim, agora é possível fazer ambos.

### Como migrar

Consulte nosso [Guia de Migração](./migration.md).