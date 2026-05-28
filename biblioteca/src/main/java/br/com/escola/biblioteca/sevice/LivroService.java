 package br.com.escola.biblioteca.sevice;

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

    public Livro salvar(br.com.escola.biblioteca.model.Livro livro) {
        
        livro.setQuantidadeDisponivel(
            livro.getQuantidadeTotal());

            livro.setQuantidadeAlugada(0);

            livro.setQuantidadeRepetida(
                livro.getQuantidadeTotal());
            
        return repository.save(livro);
    }

    public List<Livro> listaTodos() {
        return repository.findAll();
    }

    public Livro buscarPorId(Long id) {

        return repository.findById(id)
        .orElseThrow(() ->

            new RuntimeException("Livro não encontrado com id: " + id));

}

public void deletar(Long id) {
    repository.deleteById(id);
}
}
