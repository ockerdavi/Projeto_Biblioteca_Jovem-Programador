package br.com.escola.biblioteca.controller;

import br.com.escola.biblioteca.model.Livro;
import br.com.escola.biblioteca.service.LivroService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
    public Livro salvar(@RequestBody Livro livro) {
        return service.salvar(livro);
    }
    
    // GET /api/livros - Listar todos
    @GetMapping
    public List<Livro> listarTodos() {
        return service.listarTodos();
    }

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