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
        Cliente cliente = clienteRepository.findById(emprestimo.getCliente().getId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        Livro livro = livroRepository.findById(emprestimo.getLivro().getId())
                .orElseThrow(() -> new RuntimeException("Livro não encontrado"));

        boolean isReserva = "PENDENTE".equalsIgnoreCase(emprestimo.getStatus());

        emprestimo.setCliente(cliente);
        emprestimo.setLivro(livro);

        if (emprestimo.getDataEmprestimo() == null) {
            emprestimo.setDataEmprestimo(LocalDate.now());
        }

        if (isReserva) {
            emprestimo.setStatus("PENDENTE");
            if (emprestimo.getDiasPermitidos() == null) {
                emprestimo.setDiasPermitidos(0);
            }
            emprestimo.setMulta(BigDecimal.ZERO);
            return repository.save(emprestimo);
        }

        if (livro.getQuantidadeDisponivel() == null || livro.getQuantidadeDisponivel() <= 0) {
            throw new RuntimeException("Livro não está disponível para empréstimo");
        }

        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
        livro.setQuantidadeAlugada((livro.getQuantidadeAlugada() != null ? livro.getQuantidadeAlugada() : 0) + 1);
        livroRepository.save(livro);

        emprestimo.setStatus("EM_ANDAMENTO");

        if (emprestimo.getDiasPermitidos() == null || emprestimo.getDiasPermitidos() == 0) {
            emprestimo.setDiasPermitidos(7);
        }

        emprestimo.setDataPrevistaEntrega(emprestimo.getDataEmprestimo().plusDays(emprestimo.getDiasPermitidos()));
        emprestimo.setMulta(BigDecimal.ZERO);

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
        return devolver(id, null);
    }

    @Transactional
    public Emprestimo devolver(Long id, LocalDate dataEntrega) {
        Emprestimo emprestimo = buscarPorId(id);

        if ("DEVOLVIDO".equals(emprestimo.getStatus()) || "DEVOLVIDO_COM_MULTA".equals(emprestimo.getStatus())) {
            throw new RuntimeException("Este empréstimo já foi devolvido");
        }

        LocalDate dataRealEntrega = dataEntrega != null ? dataEntrega : LocalDate.now();
        emprestimo.setDataEntrega(dataRealEntrega);

        // USAR O VALOR DA MULTA DO LIVRO (NÃO VEM MAIS DO FRONTEND)
        BigDecimal valorMultaDiaria = emprestimo.getLivro().getValorMultaDiaria();
        if (valorMultaDiaria == null) {
            valorMultaDiaria = new BigDecimal("2.00"); // valor padrão
        }
        
        if (dataRealEntrega.isAfter(emprestimo.getDataPrevistaEntrega())) {
            long diasAtraso = ChronoUnit.DAYS.between(emprestimo.getDataPrevistaEntrega(), dataRealEntrega);
            BigDecimal multaCalculada = valorMultaDiaria.multiply(new BigDecimal(diasAtraso));
            emprestimo.setMulta(multaCalculada);
            emprestimo.setStatus("DEVOLVIDO_COM_MULTA");
        } else {
            emprestimo.setMulta(BigDecimal.ZERO);
            emprestimo.setStatus("DEVOLVIDO");
        }

        Livro livro = emprestimo.getLivro();
        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() + 1);
        livro.setQuantidadeAlugada(livro.getQuantidadeAlugada() - 1);
        livroRepository.save(livro);

        return repository.save(emprestimo);
    }

    @Transactional
    public void deletar(Long id) {
        Emprestimo emprestimo = buscarPorId(id);

        if (!"DEVOLVIDO".equals(emprestimo.getStatus()) && !"DEVOLVIDO_COM_MULTA".equals(emprestimo.getStatus())) {
            Livro livro = emprestimo.getLivro();
            livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() + 1);
            livro.setQuantidadeAlugada(livro.getQuantidadeAlugada() - 1);
            livroRepository.save(livro);
        }

        repository.delete(emprestimo);
    }

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

    @Transactional
    public Emprestimo atualizar(Long id, Emprestimo emprestimoAtualizado) {
        Emprestimo emprestimoExistente = buscarPorId(id);
        String statusAtual = emprestimoExistente.getStatus();
        String novoStatus = emprestimoAtualizado.getStatus();

        // PENDENTE -> AUTORIZADA (RESERVA ACEITA)
        if ("PENDENTE".equals(statusAtual) && "AUTORIZADA".equals(novoStatus)) {
            Livro livro = emprestimoExistente.getLivro();
            if (livro.getQuantidadeDisponivel() == null || livro.getQuantidadeDisponivel() <= 0) {
                throw new RuntimeException("Livro não está mais disponível para empréstimo");
            }

            livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
            livro.setQuantidadeAlugada((livro.getQuantidadeAlugada() != null ? livro.getQuantidadeAlugada() : 0) + 1);
            livroRepository.save(livro);

            emprestimoExistente.setStatus("AUTORIZADA");
            emprestimoExistente.setDataEmprestimo(LocalDate.now());

            if (emprestimoExistente.getDiasPermitidos() == null || emprestimoExistente.getDiasPermitidos() == 0) {
                emprestimoExistente.setDiasPermitidos(7);
            }

            emprestimoExistente.setDataPrevistaEntrega(
                    emprestimoExistente.getDataEmprestimo().plusDays(emprestimoExistente.getDiasPermitidos()));
            emprestimoExistente.setMulta(BigDecimal.ZERO);

            return repository.save(emprestimoExistente);
        }

        // AUTORIZADA -> EM_ANDAMENTO (RETIRADA EFETIVADA)
        if ("AUTORIZADA".equals(statusAtual) && "EM_ANDAMENTO".equals(novoStatus)) {
            emprestimoExistente.setStatus("EM_ANDAMENTO");
            return repository.save(emprestimoExistente);
        }

        // EM_ANDAMENTO -> DEVOLVIDO
        if ("EM_ANDAMENTO".equals(statusAtual)
                && ("DEVOLVIDO".equals(novoStatus) || "DEVOLVIDO_COM_MULTA".equals(novoStatus))) {
            Livro livro = emprestimoExistente.getLivro();

            livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() + 1);
            livro.setQuantidadeAlugada(livro.getQuantidadeAlugada() - 1);
            livroRepository.save(livro);

            emprestimoExistente.setDataEntrega(LocalDate.now());

            // USAR O VALOR DA MULTA DO LIVRO
            BigDecimal valorMultaDiaria = livro.getValorMultaDiaria();
            if (valorMultaDiaria == null) {
                valorMultaDiaria = new BigDecimal("2.00");
            }
            
            if (emprestimoExistente.getDataPrevistaEntrega() != null &&
                    LocalDate.now().isAfter(emprestimoExistente.getDataPrevistaEntrega())) {
                long diasAtraso = ChronoUnit.DAYS.between(
                        emprestimoExistente.getDataPrevistaEntrega(),
                        LocalDate.now());
                BigDecimal multaCalculada = valorMultaDiaria.multiply(new BigDecimal(diasAtraso));
                emprestimoExistente.setMulta(multaCalculada);
                emprestimoExistente.setStatus("DEVOLVIDO_COM_MULTA");
            } else {
                emprestimoExistente.setMulta(BigDecimal.ZERO);
                emprestimoExistente.setStatus("DEVOLVIDO");
            }

            return repository.save(emprestimoExistente);
        }

        // Verificar se o livro foi alterado
        if (!emprestimoExistente.getLivro().getId().equals(emprestimoAtualizado.getLivro().getId()) &&
                ("PENDENTE".equals(statusAtual) || "AUTORIZADA".equals(statusAtual))) {

            if (!"PENDENTE".equals(statusAtual)) {
                Livro livroAntigo = emprestimoExistente.getLivro();
                livroAntigo.setQuantidadeDisponivel(livroAntigo.getQuantidadeDisponivel() + 1);
                livroAntigo.setQuantidadeAlugada(livroAntigo.getQuantidadeAlugada() - 1);
                livroRepository.save(livroAntigo);
            }

            Livro novoLivro = livroRepository.findById(emprestimoAtualizado.getLivro().getId())
                    .orElseThrow(() -> new RuntimeException("Livro não encontrado"));

            if (novoLivro.getQuantidadeDisponivel() == null || novoLivro.getQuantidadeDisponivel() <= 0) {
                throw new RuntimeException("Novo livro não está disponível");
            }

            novoLivro.setQuantidadeDisponivel(novoLivro.getQuantidadeDisponivel() - 1);
            novoLivro.setQuantidadeAlugada(
                    (novoLivro.getQuantidadeAlugada() != null ? novoLivro.getQuantidadeAlugada() : 0) + 1);
            livroRepository.save(novoLivro);

            emprestimoExistente.setLivro(novoLivro);
        }

        // Verificar se o cliente foi alterado
        if (!emprestimoExistente.getCliente().getId().equals(emprestimoAtualizado.getCliente().getId())) {
            Cliente novoCliente = clienteRepository.findById(emprestimoAtualizado.getCliente().getId())
                    .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
            emprestimoExistente.setCliente(novoCliente);
        }

        if (emprestimoAtualizado.getDataEmprestimo() != null) {
            emprestimoExistente.setDataEmprestimo(emprestimoAtualizado.getDataEmprestimo());
        }

        if (emprestimoAtualizado.getDataPrevistaEntrega() != null) {
            emprestimoExistente.setDataPrevistaEntrega(emprestimoAtualizado.getDataPrevistaEntrega());
        }

        if (emprestimoAtualizado.getDataEntrega() != null) {
            emprestimoExistente.setDataEntrega(emprestimoAtualizado.getDataEntrega());
        }

        if (emprestimoAtualizado.getDiasPermitidos() != null) {
            emprestimoExistente.setDiasPermitidos(emprestimoAtualizado.getDiasPermitidos());
        }

        if (emprestimoAtualizado.getMulta() != null) {
            emprestimoExistente.setMulta(emprestimoAtualizado.getMulta());
        }

        return repository.save(emprestimoExistente);
    }
}