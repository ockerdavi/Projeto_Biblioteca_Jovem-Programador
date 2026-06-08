// EmprestimoRequestDTO.java
package br.com.escola.biblioteca.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmprestimoRequestDTO {
    private Long clienteId;
    private Long livroId;
    private LocalDate dataEmprestimo;
    private LocalDate dataPrevistaEntrega;
    private LocalDate dataEntrega;
    private Integer diasPermitidos;
    private String status;
    private BigDecimal multa;
    private BigDecimal valorMultaDiaria;
}