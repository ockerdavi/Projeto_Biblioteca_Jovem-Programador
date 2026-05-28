package br.com.escola.biblioteca.repository;

import br.com.escola.biblioteca.model.Emprestimo;
import org.springframework.data.jpa.repository.JpaRepository;


public interface EmprestimoRepository 
        extends JpaRepository<Emprestimo, Long>{

        }
    



