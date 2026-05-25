import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { MargemService } from './MargemService';
import { Orcamento } from '../models/Orcamento';
import { Cliente } from '../models/Cliente';
import { Money } from '../utils/money';
import { buildOrcamentoHtml } from '../templates/orcamentoHtml';

// CSS e HTML do PDF estão em:
//   src/templates/orcamentoCss.ts  ← estilos
//   src/templates/orcamentoHtml.ts ← estrutura HTML

interface PdfOptions {
    orcamento: Orcamento;
    cliente?: Cliente;
    empresaNome: string;
    empresaTelefone?: string;
    empresaEmail?: string;
    logoBase64?: string;
}

export class PdfService {
    /**
     * Gera o PDF do orçamento e abre o compartilhamento nativo.
     * O usuário escolhe WhatsApp, email, etc. diretamente do sistema.
     */
    static async gerarECompartilhar(options: PdfOptions): Promise<void> {
        const html = PdfService.buildHtml(options);

        const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
        });

        await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Orçamento ${options.orcamento.numero}`,
            UTI: 'com.adobe.pdf',
        });
    }

    /**
     * Apenas gera e retorna o URI local do PDF (para preview).
     */
    static async gerar(options: PdfOptions): Promise<string> {
        const html = PdfService.buildHtml(options);
        const { uri } = await Print.printToFileAsync({ html, base64: false });
        return uri;
    }

    // ─── Construção do HTML final ─────────────────────────────────────────────

    private static buildHtml(options: PdfOptions): string {
        const { orcamento, cliente, empresaNome, empresaTelefone, empresaEmail, logoBase64 } = options;
        const resultado = MargemService.calcularResultado(orcamento);

        const dataEmissao = new Date(orcamento.createdAt).toLocaleDateString('pt-BR');
        const dataValidade = new Date(
            new Date(orcamento.createdAt).getTime() + orcamento.validadeDias * 86400000
        ).toLocaleDateString('pt-BR');

        // Linhas da tabela de serviços
        const linhasServicos = orcamento.servicos
            .map((s) => `
        <tr>
          <td class="td-desc">${s.descricaoSnapshot}</td>
          <td class="td-center">${s.quantidade}</td>
          <td class="td-right">${Money.format(s.precoVendaUnitarioCentavos)}</td>
          <td class="td-right td-total">${Money.format(s.precoVendaUnitarioCentavos * s.quantidade)}</td>
        </tr>`)
            .join('');

        // Logo ou placeholder com inicial da empresa
        const logoHtml = logoBase64
            ? `<img src="data:image/png;base64,${logoBase64}" class="logo" alt="Logo" />`
            : `<div class="logo-placeholder">${empresaNome.charAt(0).toUpperCase()}</div>`;

        // HTML do desconto (apenas se houver)
        const descontoHtml = orcamento.descontoCentavos > 0
            ? `<div class="totais-row desconto">
                 <span>Desconto</span>
                 <span>− ${Money.format(orcamento.descontoCentavos)}</span>
               </div>`
            : '';

        // HTML das observações (apenas se houver)
        const observacoesHtml = orcamento.observacoes
            ? `<div class="obs-box">
                 <div class="section-title">Observações</div>
                 ${orcamento.observacoes}
               </div>`
            : '';

        // Monta o HTML final usando o template separado
        return buildOrcamentoHtml({
            logoHtml,
            empresaNome,
            empresaTelefoneHtml: empresaTelefone ? `<p>📞 ${empresaTelefone}</p>` : '',
            empresaEmailHtml: empresaEmail ? `<p>✉️ ${empresaEmail}</p>` : '',
            numero: orcamento.numero,
            dataEmissao,
            status: orcamento.status,
            clienteNome: cliente?.nome ?? 'Não informado',
            clienteTelefoneHtml: cliente?.telefone ? `<p>📞 ${cliente.telefone}</p>` : '',
            clienteEmailHtml: cliente?.email ? `<p>✉️ ${cliente.email}</p>` : '',
            clienteEnderecoHtml: cliente?.endereco ? `<p>📍 ${cliente.endereco}</p>` : '',
            dataValidade,
            validadeDias: String(orcamento.validadeDias),
            linhasServicos,
            faturamentoBruto: resultado.faturamentoBruto,
            descontoHtml,
            faturamentoLiquido: resultado.faturamentoLiquido,
            observacoesHtml,
            dataGeracao: new Date().toLocaleString('pt-BR'),
        });
    }
}