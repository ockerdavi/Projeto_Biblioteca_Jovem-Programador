package br.com.escola.biblioteca.repository;

import br.com.escola.biblioteca.model.Livro;
import org.springframework.data.jpa.repository.JpaRepository;
public interface LivroRepository
 extends JpaRepository<Livro, Long> {
}


