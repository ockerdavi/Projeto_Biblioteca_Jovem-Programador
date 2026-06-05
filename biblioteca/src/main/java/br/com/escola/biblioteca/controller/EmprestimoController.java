package br.com.escola.biblioteca.controller;

import br.com.escola.biblioteca.dto.EmprestimoRequestDTO;
import br.com.escola.biblioteca.model.Emprestimo;
import br.com.escola.biblioteca.model.Cliente;
import br.com.escola.biblioteca.model.Livro;
import br.com.escola.biblioteca.service.EmprestimoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Emprestimo> emprestar(@RequestBody EmprestimoRequestDTO dto) {
        try {
            // Criar objetos parciais só com os IDs
            Cliente cliente = new Cliente();
            cliente.setId(dto.getClienteId());

            Livro livro = new Livro();
            livro.setId(dto.getLivroId());

            // Criar o empréstimo com os objetos
            Emprestimo emprestimo = new Emprestimo();
            emprestimo.setCliente(cliente);
            emprestimo.setLivro(livro);
            emprestimo.setDataEmprestimo(dto.getDataEmprestimo());
            emprestimo.setDataPrevistaEntrega(dto.getDataPrevistaEntrega());
            emprestimo.setDataEntrega(dto.getDataEntrega());
            emprestimo.setDiasPermitidos(dto.getDiasPermitidos());
            emprestimo.setStatus(dto.getStatus());
            emprestimo.setMulta(dto.getMulta());
            emprestimo.setValorMultaDiaria(dto.getValorMultaDiaria());

            Emprestimo salvo = service.emprestar(emprestimo);
            return new ResponseEntity<>(salvo, HttpStatus.CREATED);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping
    public ResponseEntity<List<Emprestimo>> listarTodos() {
        List<Emprestimo> emprestimos = service.listarTodos();
        return ResponseEntity.ok(emprestimos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Emprestimo> buscarPorId(@PathVariable Long id) {
        try {
            Emprestimo emprestimo = service.buscarPorId(id);
            return ResponseEntity.ok(emprestimo);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Adicione este método ANTES ou DEPOIS do método devolver
    @PutMapping("/{id}")
    public ResponseEntity<Emprestimo> atualizar(@PathVariable Long id, @RequestBody EmprestimoRequestDTO dto) {
        try {
            // Criar objetos parciais só com os IDs
            Cliente cliente = new Cliente();
            cliente.setId(dto.getClienteId());

            Livro livro = new Livro();
            livro.setId(dto.getLivroId());

            // Criar o empréstimo com os novos dados
            Emprestimo emprestimo = new Emprestimo();
            emprestimo.setCliente(cliente);
            emprestimo.setLivro(livro);
            emprestimo.setDataEmprestimo(dto.getDataEmprestimo());
            emprestimo.setDataPrevistaEntrega(dto.getDataPrevistaEntrega());
            emprestimo.setDataEntrega(dto.getDataEntrega());
            emprestimo.setDiasPermitidos(dto.getDiasPermitidos());
            emprestimo.setStatus(dto.getStatus());
            emprestimo.setMulta(dto.getMulta());
            emprestimo.setValorMultaDiaria(dto.getValorMultaDiaria());

            // Chamar o service para atualizar (você precisa criar este método no Service)
            Emprestimo atualizado = service.atualizar(id, emprestimo);
            return ResponseEntity.ok(atualizado);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/devolver/{id}")
    public ResponseEntity<Emprestimo> devolver(@PathVariable Long id, @RequestBody(required = false) EmprestimoRequestDTO dto) {
        try {
            java.time.LocalDate dataEntrega = dto != null ? dto.getDataEntrega() : null;
            Emprestimo emprestimo = service.devolver(id, dataEntrega);
            return ResponseEntity.ok(emprestimo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            service.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Emprestimo>> buscarPorCliente(@PathVariable Long clienteId) {
        List<Emprestimo> emprestimos = service.buscarPorCliente(clienteId);
        return ResponseEntity.ok(emprestimos);
    }

    @GetMapping("/livro/{livroId}")
    public ResponseEntity<List<Emprestimo>> buscarPorLivro(@PathVariable Long livroId) {
        List<Emprestimo> emprestimos = service.buscarPorLivro(livroId);
        return ResponseEntity.ok(emprestimos);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Emprestimo>> buscarPorStatus(@PathVariable String status) {
        List<Emprestimo> emprestimos = service.buscarPorStatus(status);
        return ResponseEntity.ok(emprestimos);
    }

    @GetMapping("/atrasados")
    public ResponseEntity<List<Emprestimo>> buscarAtrasados() {
        List<Emprestimo> emprestimos = service.buscarAtrasados();
        return ResponseEntity.ok(emprestimos);
    }
}