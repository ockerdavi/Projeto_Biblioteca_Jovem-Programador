package br.com.escola.biblioteca.controller;

import br.com.escola.biblioteca.model.Cliente;
import br.com.escola.biblioteca.service.ClienteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
/*Importa anotações do Spring para criar endpoints com a REST */
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin("*")
/* Vai permitir requisições de qualquer origem */

public class ClienteController {
    private static final Logger logger = LoggerFactory.getLogger(ClienteController.class);

    private final ClienteService service;

    public ClienteController(ClienteService service) {
        this.service = service;
    }
    
    @PostMapping
    public Cliente salvar(@Valid @RequestBody Cliente cliente) {
        logger.info("[API] Recebendo cadastro de cliente: email={} cpf={}", cliente.getEmail(), cliente.getCpf());
        try {
            Cliente salvo = service.salvar(cliente);
            logger.info("[API] Cliente salvo id={} email={}", salvo.getId(), salvo.getEmail());
            return salvo;
        } catch (RuntimeException ex) {
            logger.warn("[API] Erro ao salvar cliente: {}", ex.getMessage());
            throw ex;
        }
    /*POST: recebe um Cliente no corpo da requisição e salva */
    }
    
    @GetMapping
    public List<Cliente> listarTodos() {
        return service.listarTodos();
    /*GET: mostra todos os clientes cadastrados */
    }
    
    @GetMapping("/{id}")
    public Cliente buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
     /*GET: busca cliente pelo ID */
    }
    
    @PutMapping("/{id}")
    public Cliente atualizar(@PathVariable Long id, @Valid @RequestBody Cliente cliente) {
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

    @PostMapping("/login")
    public Cliente login(@RequestBody java.util.Map<String, String> payload) {
        String email = payload.get("email");
        String senha = payload.get("senha");
        logger.info("[API] Tentativa de login: email={}", email);
        try {
            Cliente c = service.autenticar(email, senha);
            logger.info("[API] Login bem-sucedido: id={} email={}", c.getId(), c.getEmail());
            return c;
        } catch (RuntimeException ex) {
            logger.warn("[API] Falha no login para email={}: {}", email, ex.getMessage());
            throw ex;
        }
    }

    // Método de diagnóstico: expor todos os clientes (útil em dev)
    @GetMapping("/all")
    public List<Cliente> listarTodosDebug() {
        return service.findAll();
    }
}