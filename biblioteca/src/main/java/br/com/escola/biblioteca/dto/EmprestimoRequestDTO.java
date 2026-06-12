package br.com.escola.biblioteca.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmprestimoRequestDTO {
    private Long clienteId;
    private Long livroId;
    private LocalDate dataEmprestimo;
    private LocalDate dataPrevistaEntrega;
    private LocalDate dataEntrega;
    private Integer diasPermitidos;
    private String status;
    private BigDecimal multa;
    // REMOVIDO: private BigDecimal valorMultaDiaria; - Não precisa mais enviar
}