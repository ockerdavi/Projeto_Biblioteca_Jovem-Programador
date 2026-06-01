package br.com.escola.biblioteca.repository;

import br.com.escola.biblioteca.model.Livro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LivroRepository extends JpaRepository<Livro, Long> {
    // Pronto! O Spring Data JPA já fornece os métodos de salvar, buscar, etc.
}