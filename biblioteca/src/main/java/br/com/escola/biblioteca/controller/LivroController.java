package br.com.escola.biblioteca.controller;

import br.com.escola.biblioteca.model.Livro;
import br.com.escola.biblioteca.service.LivroService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/livros")
@CrossOrigin("*")
public class LivroController {

    private final LivroService service;

    public LivroController(LivroService service) {
        this.service = service;
    }

    // POST /api/livros - Criar livro (com ou sem imagem)
    @PostMapping
    public ResponseEntity<?> salvar(
            @RequestParam("titulo") String titulo,
            @RequestParam("isbn") String isbn,
            @RequestParam("autor") String autor,
            @RequestParam("categoria") String categoria,
            @RequestParam("quantidade") Integer quantidade,
            @RequestParam(value = "capa", required = false) MultipartFile capa,
            @RequestParam(value = "valorMultaDiaria", required = false) BigDecimal valorMultaDiaria) {

        try {
            Livro livro = new Livro();
            livro.setTitulo(titulo);
            livro.setIsbn(isbn);
            livro.setAutor(autor);
            livro.setCategoria(categoria);
            livro.setQuantidadeTotal(quantidade);
            livro.setQuantidadeDisponivel(quantidade);
            livro.setQuantidadeAlugada(0);

            // Definir valor da multa (padrão R$ 2,00 se não informado)
            if (valorMultaDiaria != null) {
                livro.setValorMultaDiaria(valorMultaDiaria);
            } else {
                livro.setValorMultaDiaria(new BigDecimal("2.00"));
            }

            // Salvar a imagem se foi enviada
            if (capa != null && !capa.isEmpty()) {
                String nomeArquivo = System.currentTimeMillis() + "_" + capa.getOriginalFilename();
                String uploadDir = "uploads/capas/";
                File diretorio = new File(uploadDir);
                if (!diretorio.exists()) {
                    diretorio.mkdirs();
                }

                Path caminho = Paths.get(uploadDir + nomeArquivo);
                Files.copy(capa.getInputStream(), caminho, StandardCopyOption.REPLACE_EXISTING);

                livro.setCapaUrl("/uploads/capas/" + nomeArquivo);
            }

            Livro livroSalvo = service.salvar(livro);
            return new ResponseEntity<>(livroSalvo, HttpStatus.CREATED);

        } catch (IOException e) {
            e.printStackTrace();
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao fazer upload da imagem: " + e.getMessage());
            return new ResponseEntity<>(erro, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao salvar livro: " + e.getMessage());
            return new ResponseEntity<>(erro, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // PUT /api/livros/{id} - Atualizar livro com imagem
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
            @PathVariable Long id,
            @RequestParam("titulo") String titulo,
            @RequestParam("isbn") String isbn,
            @RequestParam("autor") String autor,
            @RequestParam("categoria") String categoria,
            @RequestParam("quantidade") Integer quantidade,
            @RequestParam(value = "capa", required = false) MultipartFile capa,
            @RequestParam(value = "valorMultaDiaria", required = false) BigDecimal valorMultaDiaria) {

        try {
            Livro livroAtualizado = new Livro();
            livroAtualizado.setTitulo(titulo);
            livroAtualizado.setIsbn(isbn);
            livroAtualizado.setAutor(autor);
            livroAtualizado.setCategoria(categoria);
            livroAtualizado.setQuantidadeTotal(quantidade);

            if (valorMultaDiaria != null) {
                livroAtualizado.setValorMultaDiaria(valorMultaDiaria);
            }

            // Salvar nova imagem se foi enviada
            if (capa != null && !capa.isEmpty()) {
                String nomeArquivo = System.currentTimeMillis() + "_" + capa.getOriginalFilename();
                String uploadDir = "uploads/capas/";
                File diretorio = new File(uploadDir);
                if (!diretorio.exists()) {
                    diretorio.mkdirs();
                }

                Path caminho = Paths.get(uploadDir + nomeArquivo);
                Files.copy(capa.getInputStream(), caminho, StandardCopyOption.REPLACE_EXISTING);

                livroAtualizado.setCapaUrl("/uploads/capas/" + nomeArquivo);
            }

            Livro livro = service.atualizar(id, livroAtualizado);
            return ResponseEntity.ok(livro);

        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Livro não encontrado: " + e.getMessage());
            return new ResponseEntity<>(erro, HttpStatus.NOT_FOUND);
        } catch (IOException e) {
            e.printStackTrace();
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao fazer upload da imagem: " + e.getMessage());
            return new ResponseEntity<>(erro, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET /api/livros - Listar todos
    @GetMapping
    public ResponseEntity<List<Livro>> listarTodos() {
        List<Livro> livros = service.listarTodos();
        return ResponseEntity.ok(livros);
    }

    // GET /api/livros/{id} - Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<Livro> buscarPorId(@PathVariable Long id) {
        try {
            Livro livro = service.buscarPorId(id);
            return ResponseEntity.ok(livro);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/livros/{id} - Deletar livro
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            service.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ============================================
    // ENDPOINT ÚNICO PARA BUSCAR IMAGENS
    // ============================================
    @GetMapping("/imagem/{nomeArquivo}")
    public ResponseEntity<byte[]> buscarImagem(@PathVariable String nomeArquivo) {
        try {
            // Tenta encontrar em múltiplos locais
            String[] possiveisCaminhos = {
                "uploads/capas/" + nomeArquivo,
                System.getProperty("user.dir") + "/uploads/capas/" + nomeArquivo,
                "src/main/resources/static/uploads/capas/" + nomeArquivo
            };
            
            Path caminho = null;
            for (String caminhoStr : possiveisCaminhos) {
                Path testPath = Paths.get(caminhoStr);
                if (Files.exists(testPath)) {
                    caminho = testPath;
                    break;
                }
            }
            
            if (caminho == null) {
                System.out.println("Imagem não encontrada: " + nomeArquivo);
                return ResponseEntity.notFound().build();
            }
            
            byte[] imagem = Files.readAllBytes(caminho);
            String contentType = Files.probeContentType(caminho);
            
            if (contentType == null) {
                if (nomeArquivo.endsWith(".webp")) {
                    contentType = "image/webp";
                } else if (nomeArquivo.endsWith(".jpg") || nomeArquivo.endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (nomeArquivo.endsWith(".png")) {
                    contentType = "image/png";
                } else {
                    contentType = "application/octet-stream";
                }
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(imagem);
                    
        } catch (IOException e) {
            System.out.println("Erro ao ler imagem: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}