package br.com.escola.biblioteca.controller;

import br.com.escola.biblioteca.model.Cliente;
/*aqui teria que colocar cliente service (verificar) */
import org.springframework.web.bind.annotation.*;
/*Importa anotações do Spring para criar endpoints com a REST */
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin("*")
/* Vai permitir requisições de qualquer origem */

public class ClienteController {
    
    private final ClienteService service;
    
    public ClienteController(ClienteService service) {
        this.service = service;
    }
    
    @PostMapping
    public Cliente salvar(@RequestBody Cliente cliente) {
        return service.salvar(cliente);
    /*POST: recebe um Cliente no corpo da requisição e salva */
    }
    
    @GetMapping
    public List<Cliente> listarTodos() {
        return service.listarTodos();
    /*GET: mostra todos os clientes cadastrados */
    }
    
    @GetMapping("/{id}")
    public Cliente buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    /*GET: busca cliente pelo ID */
    }
    
    @PutMapping("/{id}")
    public Cliente atualizar(@PathVariable Long id, @RequestBody Cliente cliente) {
        return service.atualizar(id, cliente);
    /*PUT: atualiza clientes existentes (já cadastrados) pelo ID */
    }
    
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    /*DELETE: remove cliente pelo ID */
    }
    
    @GetMapping("/cpf/{cpf}")
    public Cliente buscarPorCpf(@PathVariable String cpf) {
        return service.buscarPorCpf(cpf);
    /*GET: busca cliente pelo CPF */
    }
    
    @GetMapping("/ativos")
    public List<Cliente> listarAtivos() {
        return service.listarAtivos();
    /*GET: mostra os clientes que estão com o cadastro ativo */
    }
}

