package br.com.escola.biblioteca.repository;

import br.com.escola.biblioteca.model.Livro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LivroRepository extends JpaRepository<Livro, Long> {
    
    // Buscar por ISBN (único)
    Optional<Livro> findByIsbn(String isbn);
    
    // Buscar por título (ignorando maiúsculas/minúsculas)
    List<Livro> findByTituloContainingIgnoreCase(String titulo);
    
    // Buscar por autor
    List<Livro> findByAutorContainingIgnoreCase(String autor);
    
    // Buscar por categoria
    List<Livro> findByCategoriaIgnoreCase(String categoria);
    
    // Buscar livros disponíveis (quantidadeDisponivel > 0)
    List<Livro> findByQuantidadeDisponivelGreaterThan(Integer quantidade);
    
    // Buscar livros com estoque baixo (quantidadeDisponivel <= limite)
    List<Livro> findByQuantidadeDisponivelLessThanEqual(Integer limite);
    
    // Buscar livros mais alugados
    List<Livro> findByOrderByQuantidadeAlugadaDesc();
     
    
    // Buscar por quantidade total maior que
    List<Livro> findByQuantidadeTotalGreaterThan(Integer quantidade);
    
    // Buscar livros por categoria e disponíveis
    List<Livro> findByCategoriaIgnoreCaseAndQuantidadeDisponivelGreaterThan(String categoria, Integer quantidade);
}