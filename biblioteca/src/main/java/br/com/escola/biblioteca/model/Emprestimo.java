package br.com.escola.biblioteca.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "emprestimos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Emprestimo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;
    @ManyToOne
    @JoinColumn(name = "livro_id")
    private Livro livro;
    private LocalDate dataEmprestimo;
    private LocalDate dataPrevistaEntrega;
    private LocalDate dataEntrega;
    private Integer diasPermitidos;
    private String status;
    private BigDecimal multa;
    private BigDecimal valorMultaDiaria;
}