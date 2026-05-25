import { orcamentoCss } from './orcamentoCss';

interface OrcamentoHtmlVars {
    css?: string;
    logoHtml: string;
    empresaNome: string;
    empresaTelefoneHtml: string;
    empresaEmailHtml: string;
    numero: string;
    dataEmissao: string;
    status: string;
    clienteNome: string;
    clienteTelefoneHtml: string;
    clienteEmailHtml: string;
    clienteEnderecoHtml: string;
    dataValidade: string;
    validadeDias: string;
    linhasServicos: string;
    faturamentoBruto: string;
    descontoHtml: string;
    faturamentoLiquido: string;
    observacoesHtml: string;
    dataGeracao: string;
}

// Estrutura HTML do orçamento PDF separada da lógica de geração
export function buildOrcamentoHtml(vars: OrcamentoHtmlVars): string {
    const css = vars.css ?? orcamentoCss;

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Orçamento ${vars.numero}</title>
  <style>${css}</style>
</head>
<body>

  <!-- CABEÇALHO -->
  <div class="header">
    <div style="display:flex; align-items:center; gap:18px;">
      ${vars.logoHtml}
      <div class="empresa-info">
        <h1>${vars.empresaNome}</h1>
        ${vars.empresaTelefoneHtml}
        ${vars.empresaEmailHtml}
      </div>
    </div>
    <div class="orcamento-badge">
      <div class="label">Orçamento</div>
      <div class="numero">${vars.numero}</div>
      <div style="font-size:12px; color:#555; margin-top:4px;">Emitido em ${vars.dataEmissao}</div>
      <div class="badge-status">${vars.status}</div>
    </div>
  </div>

  <!-- INFORMAÇÕES CLIENTE / VALIDADE -->
  <div class="info-grid">
    <div class="info-block">
      <div class="section-title">Cliente</div>
      <p><strong>${vars.clienteNome}</strong></p>
      ${vars.clienteTelefoneHtml}
      ${vars.clienteEmailHtml}
      ${vars.clienteEnderecoHtml}
    </div>
    <div class="info-block">
      <div class="section-title">Validade</div>
      <p>Este orçamento é válido até <strong>${vars.dataValidade}</strong></p>
      <p style="color:#888; font-size:12px; margin-top:4px;">(${vars.validadeDias} dias corridos)</p>
    </div>
  </div>

  <!-- TABELA DE SERVIÇOS -->
  <div class="section-title" style="margin-bottom:10px;">Serviços</div>
  <table>
    <thead>
      <tr>
        <th class="th-desc">Descrição</th>
        <th class="th-center">Qtd.</th>
        <th class="th-right">Valor Unit.</th>
        <th class="th-right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${vars.linhasServicos}
    </tbody>
  </table>

  <!-- TOTAIS -->
  <div class="totais">
    <div class="totais-box">
      <div class="totais-row">
        <span>Subtotal</span>
        <span>${vars.faturamentoBruto}</span>
      </div>
      ${vars.descontoHtml}
      <div class="totais-row total-final">
        <span>TOTAL</span>
        <span>${vars.faturamentoLiquido}</span>
      </div>
    </div>
  </div>

  <!-- OBSERVAÇÕES -->
  ${vars.observacoesHtml}

  <!-- AVISO VALIDADE -->
  <div class="validade-aviso">
    ⚠️ Orçamento válido por ${vars.validadeDias} dias. Após essa data, os valores podem ser revisados.
  </div>

  <!-- RODAPÉ -->
  <div class="footer">
    Documento gerado em ${vars.dataGeracao} · ${vars.empresaNome}
  </div>

</body>
</html>`;
}
