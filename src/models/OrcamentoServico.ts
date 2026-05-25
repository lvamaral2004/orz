export interface OrcamentoServico {
    id: number;
    orcamentoId: number;
    servicoId: number;
    descricaoSnapshot: string;
    quantidade: number;
    precoVendaUnitarioCentavos: number;
    custoTotalCentavos: number;
    readonly subtotalVendaCentavos: number;
    readonly subtotalCustoCentavos: number;
}
