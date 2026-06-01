package br.com.escola.biblioteca.controller;

import br.com.escola.biblioteca.model.Cliente;
/*aqui teria que colocar cliente service ddd (verificar) */
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin("*")

public class ClienteController {
    
    private final ClienteService service;
    
    public ClienteController(ClienteService service) {
        this.service = service;
    }
    
    @PostMapping
    public Cliente salvar(@RequestBody Cliente cliente) {
        return service.salvar(cliente);
    }
    
    @GetMapping
    public List<Cliente> listarTodos() {
        return service.listarTodos();
    }
    
    @GetMapping("/{id}")
    public Cliente buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }
    
    @PutMapping("/{id}")
    public Cliente atualizar(@PathVariable Long id, @RequestBody Cliente cliente) {
        return service.atualizar(id, cliente);
    }
    
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
    
    @GetMapping("/cpf/{cpf}")
    public Cliente buscarPorCpf(@PathVariable String cpf) {
        return service.buscarPorCpf(cpf);
    }
    
    @GetMapping("/ativos")
    public List<Cliente> listarAtivos() {
        return service.listarAtivos();
    }
}

