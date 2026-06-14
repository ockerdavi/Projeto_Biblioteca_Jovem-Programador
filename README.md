# 📚 Biblioteca Jovem Programador

<p align="center">
  Sistema web completo para gestão de biblioteca escolar com controle de livros, clientes e empréstimos.
</p>

<p align="center">
  <img src="assets/images/banner.png" width="800"/>
</p>

---

## 🚀 Status do Projeto

![Status](https://img.shields.io/badge/Status-Concluído-brightgreen)
![Java](https://img.shields.io/badge/Java-17-red)
![Spring Boot](https://img.shields.io/badge/SpringBoot-4-green)
![MySQL](https://img.shields.io/badge/MySQL-blue)
![Frontend](https://img.shields.io/badge/Frontend-HTML%2FCSS%2FJS-orange)

---

## 📌 Visão Geral

>Aplicação prática focada na automatização e organização de fluxos de uma biblioteca (CRUD de livros, cadastro de utilizadores e controlo rigoroso de empréstimos/devoluções). >Desenvolvido com o objetivo de consolidar conceitos de lógica de programação, arquitetura de software e design responsivo durante a formação tecnológica do programa Jovem Programador em >Santa Catarina.

---

## 🎯 Objetivo

>Desenvolver uma aplicação web capaz de organizar e automatizar processos comuns de bibliotecas escolares, facilitando o gerenciamento do acervo e o acompanhamento dos empréstimos >realizados.

---

## 🛠️ Tecnologias Utilizadas

- Java 21
- Spring Boot (API REST)
- MySQL
- HTML5
- CSS3
- JavaScript
- Git & GitHub
- Postman

---

## ⚙️ Funcionalidades

### 📘 Gestão de Livros
- Cadastro de livros
- Consulta de acervo
- Atualização de registros
- Remoção de livros

### 👤 Gestão de Leitores
- Cadastro de usuários
- Atualização de dados de usuários
- Exclusão de registros

### 📦 Empréstimos
- Registro de empréstimos
- Registro de devoluções

---

## Integrantes do Projeto 

| Nome | Função | Equipe |
|------|--------|--------|
| João | Scrum Master | Equipe 1|
|Henrique | Documentação e Desenvolvimento Backend |equipe 1|
Aline | Desenvolvimento Backend | equipe 1 | 
Davi Rios |Desenvolvimento backend |equipe 1| 
Davi Ocker |Desenvolvimento backend |equipe 1|
Samara | Elaboração de testes| equipe 2 |
Otávio | Elaboração de testes | equipe 2|
Ana Carla | Validação | equipe 2 |
David | Validação |equipe 2 |
Lilian | documentação e testes |equipe 2 |
Ana Clara | Documentação | equipe 3 |
Alexandre | Desenvolvimento Frontend | equipe 3 |
Jonathan | Desenvolvimento Frontend | equipe 3 |
Guilherme | Desenvolvimento Frontend |equipe 3|

----
  

## 🚀 Como Executar o Projeto

### 1. Clonar o repositório
```bash
git clone <REPO_URL>
````
### 2. Acessar a pasta do diretório
```bash
cd Projeto_Biblioteca_Jovem-Programador
````
### 3. Executar a aplicação
```bash
mvn spring-boot:run
````
### 4. Acessar o sistema após iniciar a aplicação, acessar: 

http://localhost:8080

---

## 🖥️ Interface do Sistema

### Tela de Login
<p align="center">
  <img src="assets/images/login.png" width="700"/>
</p>

### Página Inicial
<p align="center">
  <img src="assets/images/home.png" width="700"/>
</p>

---

## 🧠 Arquitetura do Projeto

```text
src/
├── config/        # Configurações da aplicação
├── controller/    # Endpoints REST
├── dto/           # Objetos de transferência de dados
├── model/         # Entidades do sistema
├── repository/    # Acesso ao banco de dados
├── service/       # Regras de negócio
└── resources/     # Recursos da aplicação

static/
├── css/           # Estilos da interface
├── js/            # Scripts do frontend
└── *.html         # Páginas da aplicação
```


--- 

## 📜 Licença

>Este projeto foi desenvolvido para fins educacionais como parte do Programa Jovem Programador (SEPROSC / SENAC-SC).
