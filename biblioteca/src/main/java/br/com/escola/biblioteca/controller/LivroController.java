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
            @RequestParam(value = "capa", required = false) MultipartFile capa) {
        
        try {
            Livro livro = new Livro();
            livro.setTitulo(titulo);
            livro.setIsbn(isbn);
            livro.setAutor(autor);
            livro.setCategoria(categoria);
            livro.setQuantidadeTotal(quantidade);
            
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
            @RequestParam(value = "capa", required = false) MultipartFile capa) {
        
        try {
            Livro livroAtualizado = new Livro();
            livroAtualizado.setTitulo(titulo);
            livroAtualizado.setIsbn(isbn);
            livroAtualizado.setAutor(autor);
            livroAtualizado.setCategoria(categoria);
            livroAtualizado.setQuantidadeTotal(quantidade);
            
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
    
    // Servir imagens estáticas
    @GetMapping("/uploads/capas/{nomeArquivo}")
    public ResponseEntity<byte[]> getImagem(@PathVariable String nomeArquivo) {
        try {
            Path caminho = Paths.get("uploads/capas/" + nomeArquivo);
            byte[] imagem = Files.readAllBytes(caminho);
            
            // Detectar o tipo da imagem
            String contentType = Files.probeContentType(caminho);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(imagem);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}