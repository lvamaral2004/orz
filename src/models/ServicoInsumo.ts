export interface ServicoInsumo {
    id: number;
    servicoId: number;
    insumoId: number;
    insumoNome: string;
    quantidade: number;
    precoCustoUnitarioCentavos: number;
    readonly subtotalCentavos: number;
}
