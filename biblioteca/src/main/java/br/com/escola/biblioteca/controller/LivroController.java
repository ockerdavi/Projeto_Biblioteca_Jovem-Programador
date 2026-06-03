package br.com.escola.biblioteca.controller;

// ==========================================
// IMPORTAÇÕES (As ferramentas que vamos usar)
// ==========================================
import br.com.escola.biblioteca.model.Livro;
import br.com.escola.biblioteca.service.LivroService;
import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * @RestController: Avisa o Spring que esta classe vai lidar com requisições da web.
 * Os retornos dos métodos serão transformados automaticamente em JSON para quem chamou a API.
 */
@RestController

/**
 * @RequestMapping: Define o endereço principal deste Controller.
 * Todas as requisições que chegarem em "http://localhost:8080/api/livros" vão cair nesta classe.
 */
@RequestMapping("/api/livros")

/**
 * @CrossOrigin("*"): Libera o acesso à sua API para qualquer front-end.
 * Sem isso, se você tentar consumir essa API usando um site em HTML/JS ou React rodando
 * em outra porta, o navegador vai bloquear por segurança (erro de CORS).
 */
@CrossOrigin("*")
public class LivroController {

    // Declara a dependência da camada de serviço.
    // Usar 'final' é uma boa prática para garantir que o serviço não seja modificado depois de injetado.
    private final LivroService service;

    /**
     * Construtor da classe (Injeção de Dependência).
     * Quando o Spring iniciar o Controller, ele mesmo se encarrega de colocar o LivroService aqui dentro.
     * Fazer isso pelo construtor é a recomendação oficial do Spring hoje em dia!
     */
    public LivroController(LivroService service) {
        this.service = service;
    }

    /**
     * Rota para CADASTRAR um novo livro.
     * @PostMapping: Faz este método escutar requisições do tipo HTTP POST.
     * @RequestBody: Pega o JSON que o usuário enviou no "corpo" da requisição (ex: lá no Postman)
     * e converte magicamente para um objeto da classe Livro.
     */
    @PostMapping
    public ResponseEntity<Livro> salvar(@RequestBody Livro livro) {
        // Pega o livro recebido e manda para o Service salvar no banco de dados.
        // O método já retorna o livro salvo (com o ID gerado pelo banco).
        Livro livroSalvo = service.salvar(livro);
        return new ResponseEntity<>(livroSalvo, HttpStatus.CREATED); // 201 - Created
    }
    
    /**
     * Rota para LISTAR todos os livros.
     * @GetMapping: Faz este método escutar requisições do tipo HTTP GET.
     * Como ele retorna um List<Livro>, o Spring vai gerar um array de JSONs como resposta.
     */
    @GetMapping
    public ResponseEntity<List<Livro>> listarTodos() {
        // Chama o Service para buscar no banco a lista completa de livros cadastrados.
        List<Livro> livros = service.listarTodos();
        return ResponseEntity.ok(livros); // 200 - OK
    }

    /**
     * Rota para BUSCAR um livro específico pelo ID.
     * @PathVariable: Captura o valor que vem na URL (ex: /api/livros/5)
     * @GetMapping("/{id}"): Define que o método responde a GET com um ID na URL
     */
    @GetMapping("/{id}")
    public ResponseEntity<Livro> buscarPorId(@PathVariable Long id) {
        Optional<Livro> livro = service.buscarPorId(id);
        if (livro.isPresent()) {
            return ResponseEntity.ok(livro.get()); // 200 - OK
        } else {
            return ResponseEntity.notFound().build(); // 404 - Not Found
        }
    }

    /**
     * Rota para ATUALIZAR um livro existente.
     * @PutMapping: Requisição HTTP PUT para atualização completa do registro
     * @PathVariable: Captura o ID do livro a ser atualizado
     * @RequestBody: Recebe os novos dados do livro em formato JSON
     */
    @PutMapping("/{id}")
    public ResponseEntity<Livro> atualizar(@PathVariable Long id, @RequestBody Livro livro) {
        try {
            Livro livroAtualizado = service.atualizar(id, livro);
            return ResponseEntity.ok(livroAtualizado); // 200 - OK
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // 404 - Not Found
        }
    }

    /**
     * Rota para DELETAR um livro pelo ID.
     * @DeleteMapping: Requisição HTTP DELETE para remover o registro
     * @PathVariable: Captura o ID do livro a ser deletado
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            service.deletar(id);
            return ResponseEntity.noContent().build(); // 204 - No Content
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // 404 - Not Found
        }
    }
}