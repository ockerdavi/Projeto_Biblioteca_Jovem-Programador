package br.com.escola.biblioteca.controller;

import br.com.escola.biblioteca.model.Livro;
import br.com.escola.biblioteca.service.LivroService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
@RequestMapping("/api/livros")
@CrossOrigin("*")
public class LivroController {

    private final LivroService service;

    public LivroController(LivroService service) {
        this.service = service;
    }

    // POST /api/livros - Criar livro
    @PostMapping
    public ResponseEntity<Livro> salvar(@RequestBody Livro livro) {
        // Pega o livro recebido e manda para o Service salvar no banco de dados.
        // O método já retorna o livro salvo (com o ID gerado pelo banco).
        Livro livroSalvo = service.salvar(livro);
        return new ResponseEntity<>(livroSalvo, HttpStatus.CREATED); // 201 - Created
    }
    
    // GET /api/livros - Listar todos
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
    

    // GET /api/livros/{id} - Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<Livro> buscarPorId(@PathVariable Long id) {
        try {
            Livro livro = service.buscarPorId(id);
            return ResponseEntity.ok(livro);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PUT /api/livros/{id} - Atualizar livro
    @PutMapping("/{id}")
    public ResponseEntity<Livro> atualizar(@PathVariable Long id, @RequestBody Livro livro) {
        try {
            Livro atualizado = service.atualizar(id, livro);
            return ResponseEntity.ok(atualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/livros/{id} - Deletar livro
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            service.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}