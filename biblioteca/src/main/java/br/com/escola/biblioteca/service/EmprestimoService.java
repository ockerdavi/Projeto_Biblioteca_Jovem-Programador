package br.com.escola.biblioteca.service;

import br.com.escola.biblioteca.model.Emprestimo;
import br.com.escola.biblioteca.model.Livro;
import br.com.escola.biblioteca.model.Cliente;
import br.com.escola.biblioteca.repository.EmprestimoRepository;
import br.com.escola.biblioteca.repository.LivroRepository;
import br.com.escola.biblioteca.repository.ClienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class EmprestimoService {
    
    private final EmprestimoRepository repository;
    private final LivroRepository livroRepository;
    private final ClienteRepository clienteRepository;
    
    public EmprestimoService(EmprestimoRepository repository, 
                             LivroRepository livroRepository,
                             ClienteRepository clienteRepository) {
        this.repository = repository;
        this.livroRepository = livroRepository;
        this.clienteRepository = clienteRepository;
    }
    
    @Transactional
    public Emprestimo emprestar(Emprestimo emprestimo) {
        // Verificar se cliente existe
        Cliente cliente = clienteRepository.findById(emprestimo.getCliente().getId())
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        
        // Verificar se livro existe
        Livro livro = livroRepository.findById(emprestimo.getLivro().getId())
            .orElseThrow(() -> new RuntimeException("Livro não encontrado"));
        
        // Verificar se há quantidade disponível
        if (livro.getQuantidadeDisponivel() == null || livro.getQuantidadeDisponivel() <= 0) {
            throw new RuntimeException("Livro não está disponível para empréstimo");
        }
        
        // Verificar se cliente tem empréstimos em atraso
        List<Emprestimo> emprestimosAtrasados = repository.findByClienteIdAndStatusAndDataPrevistaEntregaBefore(
            cliente.getId(), "EM_ANDAMENTO", LocalDate.now());
        
        if (!emprestimosAtrasados.isEmpty()) {
            throw new RuntimeException("Cliente possui empréstimos em atraso");
        }
        
        // Configurar dados do empréstimo
        emprestimo.setCliente(cliente);
        emprestimo.setLivro(livro);
        emprestimo.setDataEmprestimo(LocalDate.now());
        emprestimo.setStatus("EM_ANDAMENTO");
        
        // Definir dias permitidos (padrão 7 se não vier no request)
        if (emprestimo.getDiasPermitidos() == null) {
            emprestimo.setDiasPermitidos(7);
        }
        
        // Calcular data prevista de entrega
        emprestimo.setDataPrevistaEntrega(LocalDate.now().plusDays(emprestimo.getDiasPermitidos()));
        
        // Configurar valor da multa diária (padrão R$ 2,00 se não vier)
        if (emprestimo.getValorMultaDiaria() == null) {
            emprestimo.setValorMultaDiaria(new BigDecimal("2.00"));
        }
        
        // Inicializar multa como zero
        emprestimo.setMulta(BigDecimal.ZERO);
        
        // Atualizar quantidades do livro
        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
        livro.setQuantidadeAlugada((livro.getQuantidadeAlugada() != null ? livro.getQuantidadeAlugada() : 0) + 1);
        livroRepository.save(livro);
        
        return repository.save(emprestimo);
    }
    
    public List<Emprestimo> listarTodos() {
        return repository.findAll();
    }
    
    public Emprestimo buscarPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Empréstimo não encontrado com id: " + id));
    }
    
    @Transactional
    public Emprestimo devolver(Long id) {
        Emprestimo emprestimo = buscarPorId(id);
        
        if ("DEVOLVIDO".equals(emprestimo.getStatus()) || "DEVOLVIDO_COM_MULTA".equals(emprestimo.getStatus())) {
            throw new RuntimeException("Este empréstimo já foi devolvido");
        }
        
        // Atualizar data de devolução real
        emprestimo.setDataEntrega(LocalDate.now());
        
        // Calcular multa se houver atraso
        if (LocalDate.now().isAfter(emprestimo.getDataPrevistaEntrega())) {
            long diasAtraso = ChronoUnit.DAYS.between(emprestimo.getDataPrevistaEntrega(), LocalDate.now());
            BigDecimal multaCalculada = emprestimo.getValorMultaDiaria().multiply(new BigDecimal(diasAtraso));
            emprestimo.setMulta(multaCalculada);
            emprestimo.setStatus("DEVOLVIDO_COM_MULTA");
        } else {
            emprestimo.setMulta(BigDecimal.ZERO);
            emprestimo.setStatus("DEVOLVIDO");
        }
        
        // Atualizar quantidades do livro
        Livro livro = emprestimo.getLivro();
        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() + 1);
        livro.setQuantidadeAlugada(livro.getQuantidadeAlugada() - 1);
        
        // Incrementar quantidade repetida se for reincidente
        if (emprestimo.getStatus().equals("DEVOLVIDO_COM_MULTA")) {
            livro.setQuantidadeRepetida((livro.getQuantidadeRepetida() != null ? livro.getQuantidadeRepetida() : 0) + 1);
        }
        
        livroRepository.save(livro);
        
        return repository.save(emprestimo);
    }
    
    @Transactional
    public void deletar(Long id) {
        Emprestimo emprestimo = buscarPorId(id);
        
        // Se o empréstimo não foi devolvido, devolver o livro antes de deletar
        if (!"DEVOLVIDO".equals(emprestimo.getStatus()) && !"DEVOLVIDO_COM_MULTA".equals(emprestimo.getStatus())) {
            Livro livro = emprestimo.getLivro();
            livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() + 1);
            livro.setQuantidadeAlugada(livro.getQuantidadeAlugada() - 1);
            livroRepository.save(livro);
        }
        
        repository.delete(emprestimo);
    }
    
    // Métodos extras
    public List<Emprestimo> buscarPorCliente(Long clienteId) {
        return repository.findByClienteId(clienteId);
    }
    
    public List<Emprestimo> buscarPorLivro(Long livroId) {
        return repository.findByLivroId(livroId);
    }
    
    public List<Emprestimo> buscarPorStatus(String status) {
        return repository.findByStatus(status);
    }
    
    public List<Emprestimo> buscarAtrasados() {
        return repository.findEmprestimosAtrasados();
    }
    
    public BigDecimal calcularTotalMultasCliente(Long clienteId) {
        BigDecimal totalMultas = repository.sumMultaByClienteId(clienteId);
        return totalMultas != null ? totalMultas : BigDecimal.ZERO;
    }
}