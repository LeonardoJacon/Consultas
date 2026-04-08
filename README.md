# Sistema de Consultas

Este projeto é uma aplicação web desenvolvida em React para gerenciamento de usuários, permitindo cadastro, edição , uso de API assíncrona e validação de dados de forma dinâmica no frontend.

## Funcionalidades

- Cadastro de usuários
- Edição de dados
- Validação de formulário em tempo real
- Feedback visual com mensagens de erro e sucesso
- Persistência de dados (localStorage)
- API de CEP para preenchimento dos campos
## Validações implementadas

- CPF deve conter exatamente 11 dígitos
- CPF não pode ser duplicado
- Idade deve estar entre 1 e 120 anos
- Nome deve conter apenas letras e no mínimo 3 caracteres

## Tecnologias utilizadas

- React
- JavaScript
- HTML
- CSS

## Dependências

Este projeto utiliza as seguintes dependências principais:

- react
- react-dom
- vite (ou create-react-app, dependendo do seu setup)

Para instalar todas as dependências, utilize:

```bash
npm install
Como executar o projeto

Clone o repositório:

git clone https://github.com/LeonardoJacon/Consultas.git

Acesse a pasta do projeto:

cd Consultas

Instale as dependências:

npm install
Execute o projeto:

Se estiver usando Vite:

npm run dev

Se estiver usando Create React App:

npm start
Acesse no navegador:
http://localhost:5173

ou

http://localhost:3000

O objetivo do projeto é praticar desenvolvimento frontend com React, incluindo manipulação de estado, validação de formulários e organização de componentes.
