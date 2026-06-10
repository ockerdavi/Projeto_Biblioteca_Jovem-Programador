package br.com.escola.biblioteca.repository;

import br.com.escola.biblioteca.model.Emprestimo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;


public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {
    
    // Buscar empréstimos por ID do cliente
    List<Emprestimo> findByClienteId(Long clienteId);
    
    // Buscar empréstimos por ID do livro
    List<Emprestimo> findByLivroId(Long livroId);
    
    // Buscar empréstimos por status
    List<Emprestimo> findByStatus(String status);
    
    // Buscar empréstimos por cliente e status
    List<Emprestimo> findByClienteIdAndStatus(Long clienteId, String status);
    
    // Buscar empréstimos por cliente, status e data prevista de entrega antes de uma data
    List<Emprestimo> findByClienteIdAndStatusAndDataPrevistaEntregaBefore(Long clienteId, String status, LocalDate data);
    
    // Buscar empréstimos com data prevista de entrega anterior a uma data e status específico
    List<Emprestimo> findByDataPrevistaEntregaBeforeAndStatus(LocalDate data, String status);
    
    // Buscar empréstimos atrasados (status EM_ANDAMENTO e dataPrevistaEntrega < hoje)
    @Query("SELECT e FROM Emprestimo e WHERE e.status = 'EM_ANDAMENTO' AND e.dataPrevistaEntrega < CURRENT_DATE")
    List<Emprestimo> findEmprestimosAtrasados();
    
    // Buscar empréstimos com multa pendente (multa > 0)
    List<Emprestimo> findByMultaGreaterThan(BigDecimal valor);
    
    // Buscar empréstimos por período de data de empréstimo
    List<Emprestimo> findByDataEmprestimoBetween(LocalDate dataInicio, LocalDate dataFim);
    
    // Buscar empréstimos com data de entrega real preenchida (já devolvidos)
    List<Emprestimo> findByDataEntregaIsNotNull();
    
    // Buscar empréstimos sem data de entrega (ainda não devolvidos)
    List<Emprestimo> findByDataEntregaIsNull();
    
    // Buscar empréstimos por cliente ordenado por data de empréstimo decrescente
    List<Emprestimo> findByClienteIdOrderByDataEmprestimoDesc(Long clienteId);
    
    // Verificar se um livro está emprestado no momento
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Emprestimo e WHERE e.livro.id = :livroId AND e.status IN ('EM_ANDAMENTO', 'ATRASADO')")
    boolean isLivroEmprestado(@Param("livroId") Long livroId);
    
    // Buscar empréstimos com detalhes do cliente e livro (evita N+1)
    @Query("SELECT e FROM Emprestimo e JOIN FETCH e.cliente JOIN FETCH e.livro WHERE e.cliente.id = :clienteId")
    List<Emprestimo> findEmprestimosByClienteWithDetails(@Param("clienteId") Long clienteId);
    
    // Calcular total de multas por cliente
    @Query("SELECT SUM(e.multa) FROM Emprestimo e WHERE e.cliente.id = :clienteId AND e.multa IS NOT NULL")
    BigDecimal sumMultaByClienteId(@Param("clienteId") Long clienteId);
    
    // Buscar empréstimos por dias permitidos
    List<Emprestimo> findByDiasPermitidos(Integer dias);
    
    // Buscar empréstimos com status e multa maior que zero
    List<Emprestimo> findByStatusAndMultaGreaterThan(String status, BigDecimal valor);
}