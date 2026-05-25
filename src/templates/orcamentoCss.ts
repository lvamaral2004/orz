// CSS do template de orçamento PDF
// Separado do TypeScript para manter a responsabilidade única
export const orcamentoCss = `
/* ── Reset e Base ── */
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #1a1a2e;
  background: #fff;
  padding: 40px;
}

/* ── Header ── */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 36px;
  padding-bottom: 24px;
  border-bottom: 3px solid #0f3460;
}
.logo { width: 80px; height: 80px; object-fit: contain; }
.logo-placeholder {
  width: 60px; height: 60px;
  background: #0f3460; color: #fff;
  font-size: 28px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border-radius: 12px;
}
.empresa-info h1 { font-size: 22px; font-weight: 700; color: #0f3460; margin-bottom: 4px; }
.empresa-info p { color: #555; font-size: 12px; line-height: 1.6; }
.orcamento-badge { text-align: right; }
.orcamento-badge .numero { font-size: 20px; font-weight: 800; color: #e94560; letter-spacing: 1px; }
.orcamento-badge .label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 2px; }
.badge-status {
  display: inline-block; background: #0f3460; color: #fff;
  padding: 3px 10px; border-radius: 20px;
  font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px;
}

/* ── Seção Cliente ── */
.section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 6px; }
.info-grid { display: flex; gap: 40px; margin-bottom: 32px; }
.info-block { flex: 1; }
.info-block p { line-height: 1.7; color: #333; }
.info-block strong { color: #0f3460; }

/* ── Tabela de Serviços ── */
table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
thead tr { background: #0f3460; color: #fff; }
thead th { padding: 11px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
.th-desc { text-align: left; }
.th-center { text-align: center; }
.th-right { text-align: right; }
tbody tr { border-bottom: 1px solid #eee; }
tbody tr:nth-child(even) { background: #f8f9fc; }
.td-desc { padding: 12px 14px; }
.td-center { padding: 12px 14px; text-align: center; }
.td-right { padding: 12px 14px; text-align: right; }
.td-total { font-weight: 600; color: #0f3460; }

/* ── Totais ── */
.totais { display: flex; justify-content: flex-end; margin-bottom: 32px; }
.totais-box { width: 300px; border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
.totais-row { display: flex; justify-content: space-between; padding: 9px 16px; border-bottom: 1px solid #eee; font-size: 13px; }
.totais-row:last-child { border-bottom: none; }
.totais-row.desconto { color: #e94560; }
.totais-row.total-final { background: #0f3460; color: #fff; font-size: 15px; font-weight: 700; }

/* ── Observações e Rodapé ── */
.obs-box {
  background: #f8f9fc; border-left: 4px solid #0f3460;
  padding: 14px 18px; border-radius: 0 8px 8px 0;
  margin-bottom: 40px; font-size: 12px; color: #444; line-height: 1.7;
}
.obs-box .section-title { margin-bottom: 8px; }
.footer { text-align: center; font-size: 11px; color: #aaa; padding-top: 20px; border-top: 1px solid #eee; }
.validade-aviso { text-align: center; font-size: 11px; color: #e94560; margin-bottom: 20px; }
`;
