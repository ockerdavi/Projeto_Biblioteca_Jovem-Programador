# REQUISITOS

## 1.1 Requisitos Funcionais

| Código | Funcionalidade |
|--------|---------------|
| RF01 | O sistema deve permitir o cadastro de livros com informações como título, autor, ISBN, categoria, quantidade disponível e valor de multa diária. |
| RF02 | O sistema deve permitir o cadastro e gerenciamento de alunos pelo bibliotecário. |
| RF03 | O sistema deve permitir autenticação de usuários (aluno e bibliotecário) por meio de login e criação de conta. |
| RF04 | O sistema deve permitir a consulta do acervo por parte do aluno. |
| RF05 | O sistema deve permitir a solicitação de reserva de livros por parte do aluno. |
| RF06 | O sistema deve permitir ao bibliotecário visualizar e gerenciar as solicitações de reserva. |
| RF07 | O sistema deve permitir o registro de empréstimos de livros pelo bibliotecário, podendo ser realizado por preenchimento manual de dados ou por ações rápidas na interface (como “aceitar reserva” ou “dar baixa”). |
| RF08 | O sistema deve permitir o registro de devolução de livros pelo bibliotecário, podendo ser realizado manualmente ou por ação direta de “devolução” na interface. |
| RF09 | O sistema deve permitir a atualização da situação do empréstimo (ex: baixa quando o livro é retirado pelo aluno). |
| RF10 | O sistema deve permitir notificação ao aluno sobre a aprovação de reserva, incluindo redirecionamento para contato externo (ex: WhatsApp). |

---

## 1.2 Requisitos Não Funcionais

| Código | Requisito |
|--------|----------|
| RNF01 | O sistema deve utilizar o banco de dados MySQL para persistência de dados. |
| RNF02 | O sistema deve ser desenvolvido utilizando arquitetura REST, com comunicação via JSON. |
| RNF03 | O sistema deve ser versionado utilizando Git e hospedado em repositório no GitHub. |
| RNF04 | O backend deve ser implementado utilizando Spring Boot (ou tecnologia equivalente definida no projeto). |
| RNF05 | O sistema deve garantir controle de acesso por autenticação de usuários (aluno e bibliotecário). |
| RNF06 | O sistema deve garantir integridade e consistência dos dados em operações de empréstimo e devolução. |

---

## 1.3 Regras de Negócio
## 1.3 Regras de Negócio

| Código | Regra |
|--------|------|
| RN01 | Um livro só pode ser emprestado se a quantidade disponível for maior que zero (`quantidade_disponivel > 0`). |
| RN02 | Cada empréstimo deve obrigatoriamente estar vinculado a um aluno e a um livro. |
| RN03 | Um empréstimo somente pode ser concluído quando houver registro de devolução associado. |
| RN04 | A reserva de um livro só pode ser realizada se houver exemplares disponíveis. |
| RN05 | A aprovação de reservas é responsabilidade exclusiva do bibliotecário. |
| RN06 | A baixa de um empréstimo deve atualizar automaticamente a quantidade disponível do livro. |
| RN07 | O sistema deve manter o histórico de empréstimos mesmo após a devolução ou encerramento. |
| RN08 | Um aluno não pode realizar múltiplos empréstimos ativos do mesmo livro ao mesmo tempo. |
| RN09 | O acesso às funcionalidades administrativas (cadastro de livros, gerenciamento de alunos e validação de reservas) é restrito ao bibliotecário. |