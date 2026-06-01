package br.com.escola.biblioteca.repository;

import br.com.escola.biblioteca.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ClienteRepository 
    extends JpaRepository<Cliente, Long>{
    
    Optional<Cliente> findByEmail(String email);
    
    Optional<Cliente> findByCpf(String cpf);
    
    List<Cliente> findByAtivoTrue();
    
}