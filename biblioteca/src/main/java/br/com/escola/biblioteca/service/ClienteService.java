package br.com.escola.biblioteca.service;

import br.com.escola.biblioteca.model.Cliente;
import br.com.escola.biblioteca.repository.ClienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository repository;

    public ClienteService(ClienteRepository repository) {
        this.repository = repository;
    }

    public Cliente salvar(Cliente cliente) {
        return repository.save(cliente);
    }

    public List<Cliente> listarTodos() {
        return repository.findAll();
    }

    public Cliente buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com id: " + id));
    }

    public Cliente atualizar(Long id, Cliente clienteAtualizado) {
        Cliente clienteExistente = buscarPorId(id);
        
        clienteExistente.setNomeCompleto(clienteAtualizado.getNomeCompleto());
        clienteExistente.setTelefone(clienteAtualizado.getTelefone());
        clienteExistente.setEmail(clienteAtualizado.getEmail());
        clienteExistente.setCep(clienteAtualizado.getCep());
        clienteExistente.setRua(clienteAtualizado.getRua());
        clienteExistente.setNumeroCasa(clienteAtualizado.getNumeroCasa());
        clienteExistente.setReferencia(clienteAtualizado.getReferencia());
        
        return repository.save(clienteExistente);
    }

    public void deletar(Long id) {
        Cliente cliente = buscarPorId(id);
        repository.delete(cliente);
    }
}