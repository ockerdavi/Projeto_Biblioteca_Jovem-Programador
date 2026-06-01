package br.com.escola.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController

@RequestMapping("/api/livros")

@CrossOrigin("*")

public class LivroController {

    private final LivroService service;

    public LivroController(LivroService service) {
        this.service = service;
    }

    @PostMapping
    public Livro salvar(@RequestBody Livro livro) {
        return service.salvar(livro);
    }
    
    @GetMapping
    public List<Livro> listaTodos() {
        return service.listaTodos();
    }
}
