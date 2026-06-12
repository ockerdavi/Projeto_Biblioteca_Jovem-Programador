package br.com.escola.biblioteca.service;

import br.com.escola.biblioteca.model.Cliente;
import br.com.escola.biblioteca.repository.ClienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository repository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public ClienteService(ClienteRepository repository) {
        this.repository = repository;
    }

    public Cliente salvar(Cliente cliente) {
        if (repository.findByCpf(cliente.getCpf()).isPresent()) {
            throw new RuntimeException("CPF já cadastrado no sistema");
        }
        if (repository.findByEmail(cliente.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado no sistema");
        }
        cliente.setAtivo(true);

        // Preencher valores padrão para colunas que podem ser NOT NULL no esquema
        if (cliente.getCep() == null) cliente.setCep("");
        if (cliente.getRua() == null) cliente.setRua("");
        if (cliente.getNumeroCasa() == null) cliente.setNumeroCasa("");
        if (cliente.getReferencia() == null) cliente.setReferencia("");
        if (cliente.getTelefone() == null) cliente.setTelefone("");
        if (cliente.getWhatsapp() == null) cliente.setWhatsapp("");
        if (cliente.getInstituicao() == null) cliente.setInstituicao("");
        if (cliente.getPerfil() == null || cliente.getPerfil().isBlank()) cliente.setPerfil("ALUNO");

        if (cliente.getSenha() != null) {
            cliente.setSenha(encoder.encode(cliente.getSenha()));
        }

        return repository.save(cliente);
    }

    public List<Cliente> listarTodos() {
        return repository.findAll();
    }

    public Optional<Cliente> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Cliente buscarPorCpf(String cpf) {
        return repository.findByCpf(cpf)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com CPF: " + cpf));
    }

    public List<Cliente> listarAtivos() {
        return repository.findByAtivoTrue();
    }

    public java.util.List<Cliente> findAll() {
        return repository.findAll();
    }

    public Cliente autenticar(String email, String senha) {
        Cliente cliente = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email ou senha inválidos."));

        if (!encoder.matches(senha, cliente.getSenha())) {
            throw new RuntimeException("Email ou senha inválidos.");
        }

        return cliente;
    }

    public Cliente atualizar(Long id, Cliente clienteAtualizado) {
        Cliente clienteExistente = buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com id: " + id));
        
        // Validar CPF se for diferente
        if (!clienteExistente.getCpf().equals(clienteAtualizado.getCpf()) &&
            repository.findByCpf(clienteAtualizado.getCpf()).isPresent()) {
            throw new RuntimeException("CPF já cadastrado no sistema");
        }
        
        // Validar Email se for diferente
        if (!clienteExistente.getEmail().equals(clienteAtualizado.getEmail()) &&
            repository.findByEmail(clienteAtualizado.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado no sistema");
        }
        
        clienteExistente.setNomeCompleto(clienteAtualizado.getNomeCompleto());
        clienteExistente.setTelefone(clienteAtualizado.getTelefone());
        clienteExistente.setEmail(clienteAtualizado.getEmail());
        clienteExistente.setCpf(clienteAtualizado.getCpf());
        clienteExistente.setCep(clienteAtualizado.getCep());
        clienteExistente.setRua(clienteAtualizado.getRua());
        clienteExistente.setNumeroCasa(clienteAtualizado.getNumeroCasa());
        clienteExistente.setReferencia(clienteAtualizado.getReferencia());
        clienteExistente.setAtivo(clienteAtualizado.getAtivo());
        if (clienteAtualizado.getSenha() != null && !clienteAtualizado.getSenha().isBlank()) {
            clienteExistente.setSenha(encoder.encode(clienteAtualizado.getSenha()));
        }
        
        return repository.save(clienteExistente);
    }

    public void deletar(Long id) {
        Cliente cliente = buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com id: " + id));
        repository.delete(cliente);
    }
}