package br.com.escola.biblioteca.controller;

import br.com.escola.biblioteca.model.Livro;
import br.com.escola.biblioteca.service.LivroService;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<Livro> salvar(@RequestBody Livro livro) {
        Livro livroSalvo = service.salvar(livro);
        return new ResponseEntity<>(livroSalvo, HttpStatus.CREATED);
    }
    
    // GET /api/livros - Listar todos
    @GetMapping
    public ResponseEntity<List<Livro>> listarTodos() {
        List<Livro> livros = service.listarTodos();
        return ResponseEntity.ok(livros);
    }

    // GET /api/livros/{id} - Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<Livro> buscarPorId(@PathVariable Long id) {
        try {
            Livro livro = service.buscarPorId(id); // Service lança RuntimeException se não encontrar
            return ResponseEntity.ok(livro);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PUT /api/livros/{id} - Atualizar livro
    @PutMapping("/{id}")
    public ResponseEntity<Livro> atualizar(@PathVariable Long id, @RequestBody Livro livro) {
        try {
            Livro livroAtualizado = service.atualizar(id, livro);
            return ResponseEntity.ok(livroAtualizado);
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