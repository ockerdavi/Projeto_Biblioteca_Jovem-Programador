package br.com.escola.biblioteca.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "livros")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Livro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    @Column(unique = true)
    private String isbn;

    private String autor;

    private String categoria;

    private Integer quantidadeTotal;

    private Integer quantidadeDisponivel;

    private Integer quantidadeAlugada;
    
    @Column(name = "capa_url")
    private String capaUrl; // Caminho da imagem da capa
    
    @Column(name = "valor_multa_diaria")
    private BigDecimal valorMultaDiaria = new BigDecimal("2.00"); // Valor padrão da multa
}