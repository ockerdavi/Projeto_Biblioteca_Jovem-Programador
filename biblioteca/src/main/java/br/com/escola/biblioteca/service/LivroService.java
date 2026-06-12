package br.com.escola.biblioteca.service;

import br.com.escola.biblioteca.model.Livro;
import br.com.escola.biblioteca.repository.LivroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class LivroService {

    private final LivroRepository repository;

    public LivroService(LivroRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Livro salvar(Livro livro) {
        // Garantir valor padrão da multa (R$ 2,00)
        if (livro.getValorMultaDiaria() == null) {
            livro.setValorMultaDiaria(new BigDecimal("2.00"));
        }
        
        // Calcular disponíveis se necessário
        if (livro.getQuantidadeTotal() != null) {
            if (livro.getQuantidadeDisponivel() == null) {
                livro.setQuantidadeDisponivel(livro.getQuantidadeTotal());
            }
            if (livro.getQuantidadeAlugada() == null) {
                livro.setQuantidadeAlugada(0);
            }
        }
        
        return repository.save(livro);
    }

    @Transactional
    public Livro atualizar(Long id, Livro livroAtualizado) {
        Livro livroExistente = buscarPorId(id);
        
        livroExistente.setTitulo(livroAtualizado.getTitulo());
        livroExistente.setIsbn(livroAtualizado.getIsbn());
        livroExistente.setAutor(livroAtualizado.getAutor());
        livroExistente.setCategoria(livroAtualizado.getCategoria());
        livroExistente.setQuantidadeTotal(livroAtualizado.getQuantidadeTotal());
        
        // Manter valor da multa se veio novo
        if (livroAtualizado.getValorMultaDiaria() != null) {
            livroExistente.setValorMultaDiaria(livroAtualizado.getValorMultaDiaria());
        }
        
        if (livroAtualizado.getCapaUrl() != null) {
            livroExistente.setCapaUrl(livroAtualizado.getCapaUrl());
        }
        
        return repository.save(livroExistente);
    }

    public List<Livro> listarTodos() {
        return repository.findAll();
    }

    public Livro buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Livro não encontrado"));
    }

    @Transactional
    public void deletar(Long id) {
        Livro livro = buscarPorId(id);
        repository.delete(livro);
    }
}