package br.com.escola.biblioteca.controller;

import br.com.escola.biblioteca.model.Emprestimo;
import br.com.escola.biblioteca.service.EmprestimoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    private final EmprestimoService service;

    public EmprestimoController(EmprestimoService service) {
        this.service = service;
    }

    // Rota para criar um novo empréstimo
    @PostMapping
    public ResponseEntity<Emprestimo> registrar(@RequestBody Emprestimo emprestimo) {
        return ResponseEntity.ok(service.emprestar(emprestimo));
    }

    // Rota para devolver um livro
    @PostMapping("/{id}/devolver")
    public ResponseEntity<Emprestimo> devolver(@PathVariable Long id) {
        return ResponseEntity.ok(service.devolver(id));
    }
}