package br.com.escola.biblioteca.controller;

// ==========================================
// IMPORTAÇÕES DO SEU PRÓPRIO PROJETO
// ==========================================
import br.com.escola.biblioteca.model.Livro;
import br.com.escola.biblioteca.service.LivroService;
import br.com.escola.biblioteca.repository.LivroRepository;

// ==========================================
// IMPORTAÇÕES DO SPRING FRAMEWORK
// ==========================================
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/estoque")
public class EstoqueController {

    // Usamos o seu Service para buscar os livros com tratamento de erro
    @Autowired
    private LivroService livroService;

    // AQUI É ONDE USAMOS O IMPORT DA LINHA 18:
    // Injetamos o Repository direto no Controller APENAS para salvar as atualizações, 
    // evitando usar o método "salvar" do LivroService que reseta as quantidades para zero.
    @Autowired
    private LivroRepository livroRepository;

    /**
     * PUT /api/estoque/adicionar/1?quantidade=5
     */
    @PutMapping("/adicionar/{livroId}")
    public ResponseEntity<Livro> adicionarEstoque(@PathVariable Long livroId, @RequestParam Integer quantidade) {
        try {
            Livro livro = livroService.buscarPorId(livroId);

            livro.setQuantidadeTotal(livro.getQuantidadeTotal() + quantidade);
            livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() + quantidade);
            
            // E AQUI USAMOS ELE DE NOVO: salva direto pelo Repository
            Livro livroAtualizado = livroRepository.save(livro);
            
            return ResponseEntity.ok(livroAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * PUT /api/estoque/saida/1
     */
    @PutMapping("/saida/{livroId}")
    public ResponseEntity<Livro> registrarSaida(@PathVariable Long livroId) {
        try {
            Livro livro = livroService.buscarPorId(livroId);

            if (livro.getQuantidadeDisponivel() <= 0) {
                return ResponseEntity.badRequest().build();
            }

            livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
            livro.setQuantidadeAlugada(livro.getQuantidadeAlugada() + 1);

            Livro livroAtualizado = livroRepository.save(livro);

            return ResponseEntity.ok(livroAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * PUT /api/estoque/retorno/1
     */
    @PutMapping("/retorno/{livroId}")
    public ResponseEntity<Livro> registrarRetorno(@PathVariable Long livroId) {
        try {
            Livro livro = livroService.buscarPorId(livroId);

            if (livro.getQuantidadeAlugada() > 0) {
                livro.setQuantidadeAlugada(livro.getQuantidadeAlugada() - 1);
                livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() + 1);
            }

            Livro livroAtualizado = livroRepository.save(livro);

            return ResponseEntity.ok(livroAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}