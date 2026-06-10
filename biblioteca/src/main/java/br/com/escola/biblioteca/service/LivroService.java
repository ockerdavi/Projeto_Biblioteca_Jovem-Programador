package br.com.escola.biblioteca.service;


import br.com.escola.biblioteca.model.Livro;
import br.com.escola.biblioteca.repository.LivroRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LivroService {
    private final LivroRepository repository;

    public LivroService(LivroRepository repository) {
        this.repository = repository;
    }

    public Livro salvar(Livro livro) {
        livro.setQuantidadeDisponivel(livro.getQuantidadeTotal());
        livro.setQuantidadeAlugada(0);
        return repository.save(livro);
    }

    public List<Livro> listarTodos() {
        return repository.findAll();
    }

    public Livro buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Livro não encontrado com id: " + id));
    }

    public Livro atualizar(Long id, Livro livroAtualizado) {
    Livro livroExistente = buscarPorId(id);

    livroExistente.setTitulo(livroAtualizado.getTitulo());
    livroExistente.setIsbn(livroAtualizado.getIsbn());
    livroExistente.setAutor(livroAtualizado.getAutor());
    livroExistente.setCategoria(livroAtualizado.getCategoria());

    int quantidadeAlugada = livroExistente.getQuantidadeAlugada() != null
            ? livroExistente.getQuantidadeAlugada()
            : 0;

    int novaQuantidadeTotal = livroAtualizado.getQuantidadeTotal() != null
            ? livroAtualizado.getQuantidadeTotal()
            : 0;

    livroExistente.setQuantidadeTotal(novaQuantidadeTotal);

    // Corrige cálculo da quantidade disponível
    livroExistente.setQuantidadeDisponivel(novaQuantidadeTotal - quantidadeAlugada);

    return repository.save(livroExistente);
}


    public void deletar(Long id) {
        Livro livro = buscarPorId(id);
        repository.delete(livro);
    }
}
