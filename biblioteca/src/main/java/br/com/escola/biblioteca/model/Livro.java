package br.com.escola.biblioteca.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "livros")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Livro {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    @Column(unique = true)
    private String isbn;

    private String autor;

    private String categoria;

    private Integer quantidadeTotal;

    private Integer quantidadeDisponivel;

    private Integer quantidadeAlugada;

    private Integer quantidadeRepetida;
}
