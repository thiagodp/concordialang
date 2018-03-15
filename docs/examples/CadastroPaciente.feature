#language:pt

Feature: Cadastro de Paciente
  Como um funcionário
  Eu desejo registrar um paciente e seus dados médicos
  Para acompanhar seu estado de saúde

Cenário: Registro sem dados médicos
  Dado que um paciente não está cadatrado
    e que estou de posse de seus documentos
  Quando preencho suas informações cadastrais básicas
  Então consigo registrar o paciente

  Variante 1: Registro básico sem dados médicos
    Dado que estou na {Tela de Cadastro de Pacientes}
	Quando eu preencho {Nome}, {CPF} e {Nascimento}
	  e preencho {Endereço}, {Cidade} e {Estado}
	  e preencho {Telefone}
	  e clico em {Salvar}
	Então vejo a mensagem "Salvo com sucesso"

  Variante 2: Registro completo sem dados médicos
	Dado que estou na {Tela de Cadastro de Pacientes}
	Quando eu preencho {Nome}, {CPF}, {RG} e {Nascimento}
	  e preencho {Endereço}, {Cidade} e {Estado}
	  e preencho {Telefone} e {Email}
	  e preencho {Nome do Pai} e {Nome da Mãe}
	  e preencho {Nome para Emergência}, {Parentesco} e {Telefone para Emergência}
	  e clico em {Salvar}
	Então vejo a mensagem "Salvo com sucesso"

Cenário: Registro com dados médicos
#   ...

Elemento de IU: Tela de Cadastro de Pacientes
  - id é "telaPaciente"
  - tipo é janela

Elemento de IU: Salvar
  - tipo é botão

Elemento de IU: Nome
  - comprimento mínimo é 2
    Caso contrário eu vejo a mensagem "Nome deve ter no mínimo 2 caracteres"
  - comprimento máximo é 100
    Caso contrário eu vejo a mensagem "Nome deve ter no máximo 100 caracteres"
  - formato é "[A-ZÀ-Ö][a-zA-ZÀ-ÖØ-öø-ÿ .-']*"
    Caso contrário eu vejo a mensagem "Nome somente aceita letras, espaço, ponto, traço e apóstrofo."

Elemento de IU: CPF
  - formato é "[0-9]{11}"
    Caso contrário eu vejo a mensagem "CPF aceita somente números e deve ter 11 dígitos."
  - valor não deve estar em "SELECT cpf FROM [hospital].paciente WHERE cpf = {CPF}"
    Caso contrário eu vejo a mensagem "Paciente já cadastrado."

# 	Sintaxes que NÃO devem ser suportadas pelo protótipo:
#
#   - valor é válido se
#     <trecho de código com função que retorna um booleano>
#
#   - valor é computador por
#     <trecho de código com função que retorna um booleano, flutuante, inteiro ou string>
#
#   Exemplo:
#
#   - valor é válido se
#   ```javascript
#   // ^ A sintaxe acima indica a linguagem a ser chamada, que deve ser uma
#   //   linguagem de script, como JavaScript (a default), Lua, PHP, etc.
#   //   Esse formato é o mesmo usado no Markdown, que virou um padrão "de facto"
#   //   de projetos opensource da indústria (GitHub, GitLab, SourceForge, etc.).
#   //   Pode-se declarar um método diretamente e retorná-lo, ou usar os recursos
#   //   da linguagem para obtê-lo de um arquivo externo, como é o caso abaixo.
#   return require( 'funcoes.js' ).cpfValido;
#   ```
#    Caso contrário eu vejo a mensagem "CPF inválido."


# ...

Banco de Dados: hospital
  - nome é "hospital"
  - tipo é "postgresql"
  - usuário é "testador"
  - senha é "teste_987"
