import { Orcamento } from '../models/Orcamento';
import { Money } from '../utils/money';
import { OrcamentoServico } from '../models/OrcamentoServico';

// ─── Tipos de retorno ────────────────────────────────────────────────────────

export interface ResultadoFinanceiro {
    // Valores brutos (em centavos)
    faturamentoBrutoCentavos: number;    // Soma dos preços de venda
    custoTotalInsumosCentavos: number;   // Soma dos custos de insumos
    descontoCentavos: number;
    faturamentoLiquidoCentavos: number;  // Bruto - Desconto
    lucroLiquidoCentavos: number;        // FaturamentoLíquido - CustoInsumos

    // Formatados para exibição
    faturamentoBruto: string;
    faturamentoLiquido: string;
    custoTotalInsumos: string;
    lucroLiquido: string;

    // Percentuais
    margemLucroPercent: number;          // (Lucro / FaturamentoLíquido) * 100
    margemLucroFormatada: string;        // "34,50%"
    markupPercent: number;               // (Lucro / Custo) * 100

    // Diagnóstico rápido para o dashboard
    diagnostico: 'excelente' | 'bom' | 'atencao' | 'prejuizo';
    diagnosticoTexto: string;
}

export interface ResultadoPorServico {
    servicoId: number;
    descricao: string;
    quantidade: number;
    precoVendaUnitario: string;
    custoUnitario: string;
    subtotalVenda: string;
    subtotalCusto: string;
    margemPercent: number;
    margemFormatada: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class MargemService {
    /**
     * Calcula o resultado financeiro completo de um orçamento.
     * Recebe um Orcamento já hidratado com seus serviços.
     */
    static calcularResultado(orcamento: Orcamento): ResultadoFinanceiro {
        const { servicos, descontoCentavos } = orcamento;

        // 1. Somar faturamento bruto (todos os preços de venda × quantidade)
        const faturamentoBrutoCentavos = servicos.reduce(
            (acc, s) => acc + s.precoVendaUnitarioCentavos * s.quantidade,
            0
        );

        // 2. Somar custo total dos insumos de todos os serviços
        const custoTotalInsumosCentavos = servicos.reduce(
            (acc, s) => acc + s.custoTotalCentavos * s.quantidade,
            0
        );

        // 3. Aplicar desconto
        const faturamentoLiquidoCentavos = faturamentoBrutoCentavos - descontoCentavos;

        // 4. Calcular lucro líquido
        const lucroLiquidoCentavos = faturamentoLiquidoCentavos - custoTotalInsumosCentavos;

        // 5. Calcular margem e markup (protegendo divisão por zero)
        const margemLucroPercent =
            faturamentoLiquidoCentavos > 0
                ? (lucroLiquidoCentavos / faturamentoLiquidoCentavos) * 100
                : 0;

        const markupPercent =
            custoTotalInsumosCentavos > 0
                ? (lucroLiquidoCentavos / custoTotalInsumosCentavos) * 100
                : 0;

        // 6. Diagnóstico para o dashboard do profissional
        const diagnostico = this.classificarMargem(margemLucroPercent);

        return {
            // Centavos (para cálculos futuros)
            faturamentoBrutoCentavos,
            custoTotalInsumosCentavos,
            descontoCentavos,
            faturamentoLiquidoCentavos,
            lucroLiquidoCentavos,

            // Formatados (para UI)
            faturamentoBruto: Money.format(faturamentoBrutoCentavos),
            faturamentoLiquido: Money.format(faturamentoLiquidoCentavos),
            custoTotalInsumos: Money.format(custoTotalInsumosCentavos),
            lucroLiquido: Money.format(lucroLiquidoCentavos),

            // Percentuais
            margemLucroPercent,
            margemLucroFormatada: Money.formatPercent(margemLucroPercent),
            markupPercent,

            // Diagnóstico
            diagnostico: diagnostico.nivel,
            diagnosticoTexto: diagnostico.texto,
        };
    }

    /**
     * Calcula a margem individual de cada serviço no orçamento.
     * Útil para mostrar quais serviços são mais/menos rentáveis.
     */
    static calcularPorServico(servicos: OrcamentoServico[]): ResultadoPorServico[] {
        return servicos.map((s) => {
            const subtotalVenda = s.precoVendaUnitarioCentavos * s.quantidade;
            const subtotalCusto = s.custoTotalCentavos * s.quantidade;
            const lucro = subtotalVenda - subtotalCusto;
            const margemPercent = subtotalVenda > 0 ? (lucro / subtotalVenda) * 100 : 0;

            return {
                servicoId: s.servicoId,
                descricao: s.descricaoSnapshot,
                quantidade: s.quantidade,
                precoVendaUnitario: Money.format(s.precoVendaUnitarioCentavos),
                custoUnitario: Money.format(s.custoTotalCentavos),
                subtotalVenda: Money.format(subtotalVenda),
                subtotalCusto: Money.format(subtotalCusto),
                margemPercent,
                margemFormatada: Money.formatPercent(margemPercent),
            };
        });
    }

    /**
     * Calcula o custo total de um serviço com base em seus insumos.
     * Usado ao montar a "receita" do serviço antes de salvar.
     */
    static calcularCustoServico(
        insumos: Array<{ precoCustoUnitarioCentavos: number; quantidade: number }>
    ): number {
        return insumos.reduce(
            (acc, i) => acc + Math.round(i.precoCustoUnitarioCentavos * i.quantidade),
            0
        );
    }

    // ─── Privado ───────────────────────────────────────────────────────────────

    private static classificarMargem(margem: number): {
        nivel: ResultadoFinanceiro['diagnostico'];
        texto: string;
    } {
        if (margem < 0) return { nivel: 'prejuizo', texto: 'Você está tendo prejuízo neste orçamento.' };
        if (margem < 20) return { nivel: 'atencao', texto: 'Margem baixa. Revise os preços ou custos.' };
        if (margem < 40) return { nivel: 'bom', texto: 'Margem saudável. Bom trabalho!' };
        return { nivel: 'excelente', texto: 'Margem excelente! Orçamento muito bem precificado.' };
    }
}