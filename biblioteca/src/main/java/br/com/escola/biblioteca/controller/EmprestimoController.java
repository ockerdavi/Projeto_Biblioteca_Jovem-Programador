package br.com.escola.biblioteca.controller;

import br.com.escola.biblioteca.model.Emprestimo;
import br.com.escola.biblioteca.service.EmprestimoService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/emprestimos")
@CrossOrigin("*")
public class EmprestimoController {
    
    private final EmprestimoService service;
    
    public EmprestimoController(EmprestimoService service) {
        this.service = service;
    }
    
    @PostMapping
    public Emprestimo emprestar(@RequestBody Emprestimo emprestimo) {
        return service.emprestar(emprestimo);
    }
    
    @GetMapping
    public List<Emprestimo> listarTodos() {
        return service.listarTodos();
    }
    
    @GetMapping("/{id}")
    public Emprestimo buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }
    
    @PutMapping("/devolver/{id}")
    public Emprestimo devolver(@PathVariable Long id) {
        return service.devolver(id);
    }
    
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
    
    // Endpoints extras
    @GetMapping("/cliente/{clienteId}")
    public List<Emprestimo> buscarPorCliente(@PathVariable Long clienteId) {
        return service.buscarPorCliente(clienteId);
    }
    
    @GetMapping("/livro/{livroId}")
    public List<Emprestimo> buscarPorLivro(@PathVariable Long livroId) {
        return service.buscarPorLivro(livroId);
    }
    
    @GetMapping("/status/{status}")
    public List<Emprestimo> buscarPorStatus(@PathVariable String status) {
        return service.buscarPorStatus(status);
    }
    
    @GetMapping("/atrasados")
    public List<Emprestimo> buscarAtrasados() {
        return service.buscarAtrasados();
    }
}
