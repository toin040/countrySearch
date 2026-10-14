# CountrySearch

## Integrantes

- Integrante 1 (nome completo)
- Integrante 2 (nome completo)

## Nome e descrição do projeto

**CountrySearch** é uma aplicação web simples para consulta e exploração de informações sobre países. O usuário pode visualizar uma lista de países, pesquisar por nome e consultar os detalhes de um país selecionado. Toda a aplicação é executada no navegador e consome dados em tempo de execução de uma API REST pública.

## Principais funcionalidades

- Listagem de países com nome, capital, moeda e bandeira.
- Pesquisa por nome, ignorando diferenças entre letras maiúsculas, minúsculas e acentos.
- Retorno à listagem completa por meio do botão "Limpar pesquisa".
- Visualização de detalhes do país selecionado: nome, capital, moeda, bandeira, população e localização geográfica (latitude e longitude).
- Formatação da população no padrão brasileiro de leitura.
- Tratamento de dados ausentes (nunca exibe `undefined` ou `null`).
- Feedback ao usuário durante operações assíncronas: carregamento, sucesso, ausência de resultados e erros de comunicação.

## API utilizada

- **API:** CountriesNow API
- **Documentação:** https://countriesnow.space/swagger-docs/
- **Endpoints utilizados:**
  - `GET /api/v0.1/countries` — lista de países com códigos ISO.
  - `GET /api/v0.1/countries/capital` — capital de cada país.
  - `GET /api/v0.1/countries/currency` — moeda de cada país.
  - `GET /api/v0.1/countries/flag/images` — bandeira de cada país.
  - `GET /api/v0.1/countries/positions` — coordenadas geográficas de cada país.
  - `GET /api/v0.1/countries/population` — série histórica de população de cada país.

Os dados são buscados em tempo de execução com `fetch` e combinados por código ISO para formar cada país exibido na interface.

## Tecnologias

- HTML5 semântico.
- CSS3 puro (responsivo e acessível).
- JavaScript (executado no navegador).
- `fetch` nativo para consumo da API REST.
- Sem frameworks, sem backend, sem banco de dados.

## Instruções de execução

A aplicação é composta por arquivos estáticos e deve ser executada em um servidor local (localhost).

1. Clone o repositório:

   ```bash
   git clone <URL_DO_REPOSITORIO>
   ```

2. Acesse a pasta do projeto:

   ```bash
   cd countrySearch
   ```

3. Inicie um servidor local em Python (já incluído na maioria dos sistemas):

   ```bash
   python -m http.server 8000
   ```

   Alternativa com Node.js:

   ```bash
   npx serve
   ```

4. Abra o navegador em:

   ```
   http://localhost:8000
   ```

Também é possível executar com a extensão **Live Server** do VS Code, abrindo o arquivo `index.html`.
