import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { PdfService } from '../../services';
import { useConfigStore } from '../../store/configStore';
import { Orcamento } from '../../models';
import { OrcamentoRepository } from '../../repositories';
import { Money } from '../../utils';
import { MargemService } from '../../services';

interface Props {
    orcamento: Orcamento;
    onVoltar: () => void;
}

const STATUS_OPCOES: Orcamento['status'][] = ['rascunho', 'enviado', 'aprovado', 'recusado'];
const STATUS_CORES: Record<Orcamento['status'], string> = {
    rascunho: '#888', enviado: '#f59e0b', aprovado: '#10b981', recusado: '#e94560',
};

export function DetalhesOrcamento({ orcamento: orcamentoInicial, onVoltar }: Props) {
    const config = useConfigStore();
    const [orcamento, setOrcamento] = useState<Orcamento>(orcamentoInicial);
    const [carregando, setCarregando] = useState(false);
    const [atualizandoStatus, setAtualizandoStatus] = useState(false);

    useEffect(() => {
        // Recarregar com serviços completos
        setCarregando(true);
        new OrcamentoRepository().findById(orcamento.id)
            .then(orc => { if (orc) setOrcamento(orc); })
            .finally(() => setCarregando(false));
    }, []);

    async function handleMudarStatus(novoStatus: Orcamento['status']) {
        try {
            setAtualizandoStatus(true);
            await new OrcamentoRepository().updateStatus(orcamento.id, novoStatus);
            setOrcamento(prev => ({ ...prev, status: novoStatus }));
        } finally {
            setAtualizandoStatus(false);
        }
    }

    async function handleCompartilhar() {
        try {
            await PdfService.gerarECompartilhar({
                orcamento,
                empresaNome: config.empresaNome,
                empresaTelefone: config.empresaTelefone,
                empresaEmail: config.empresaEmail,
                logoBase64: config.logoBase64,
            });
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível gerar o PDF. Tente novamente.');
        }
    }

    const resultado = orcamento.servicos.length > 0
        ? MargemService.calcularResultado(orcamento)
        : null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.headerRow}>
                <Pressable onPress={onVoltar} style={styles.btnVoltar}>
                    <Text style={styles.btnVoltarTexto}>← Voltar</Text>
                </Pressable>
            </View>

            <Text style={styles.numero}>{orcamento.numero}</Text>

            {orcamento.clienteNome && (
                <View style={styles.clienteBox}>
                    <Text style={styles.clienteNome}>👤 {orcamento.clienteNome}</Text>
                </View>
            )}

            {/* Status */}
            <Text style={styles.secao}>Status</Text>
            {atualizandoStatus
                ? <ActivityIndicator color="#0f3460" style={{ marginVertical: 8 }} />
                : (
                    <View style={styles.statusRow}>
                        {STATUS_OPCOES.map(s => (
                            <Pressable
                                key={s}
                                style={[
                                    styles.statusChip,
                                    { borderColor: STATUS_CORES[s] },
                                    orcamento.status === s && { backgroundColor: STATUS_CORES[s] },
                                ]}
                                onPress={() => handleMudarStatus(s)}
                            >
                                <Text style={[
                                    styles.statusChipTexto,
                                    { color: STATUS_CORES[s] },
                                    orcamento.status === s && { color: '#fff' },
                                ]}>
                                    {s}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                )
            }

            {/* Serviços */}
            {carregando ? (
                <ActivityIndicator color="#0f3460" style={{ marginTop: 24 }} />
            ) : orcamento.servicos.length > 0 ? (
                <>
                    <Text style={styles.secao}>Serviços</Text>
                    {orcamento.servicos.map(s => (
                        <View key={s.id} style={styles.servicoCard}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.servicoNome}>{s.descricaoSnapshot}</Text>
                                <Text style={styles.servicoQtd}>Qtd: {s.quantidade}</Text>
                            </View>
                            <Text style={styles.servicoValor}>
                                {Money.format(s.precoVendaUnitarioCentavos * s.quantidade)}
                            </Text>
                        </View>
                    ))}

                    {/* Resumo financeiro */}
                    {resultado && (
                        <View style={styles.resumoBox}>
                            <View style={styles.resumoRow}>
                                <Text style={styles.resumoLabel}>Subtotal</Text>
                                <Text style={styles.resumoValor}>{resultado.faturamentoBruto}</Text>
                            </View>
                            {orcamento.descontoCentavos > 0 && (
                                <View style={styles.resumoRow}>
                                    <Text style={styles.resumoLabel}>Desconto</Text>
                                    <Text style={[styles.resumoValor, { color: '#e94560' }]}>
                                        - {Money.format(orcamento.descontoCentavos)}
                                    </Text>
                                </View>
                            )}
                            <View style={[styles.resumoRow, styles.resumoTotal]}>
                                <Text style={styles.resumoTotalLabel}>Total</Text>
                                <Text style={styles.resumoTotalValor}>{resultado.faturamentoLiquido}</Text>
                            </View>
                            <View style={styles.resumoRow}>
                                <Text style={styles.resumoLabel}>Margem de Lucro</Text>
                                <Text style={[styles.resumoValor, { color: '#10b981', fontWeight: '700' }]}>
                                    {resultado.margemLucroFormatada}
                                </Text>
                            </View>
                        </View>
                    )}
                </>
            ) : (
                <Text style={styles.semServicos}>Nenhum serviço neste orçamento.</Text>
            )}

            {/* Observações */}
            {orcamento.observacoes && (
                <>
                    <Text style={styles.secao}>Observações</Text>
                    <View style={styles.obsBox}>
                        <Text style={styles.obsTexto}>{orcamento.observacoes}</Text>
                    </View>
                </>
            )}

            <Pressable style={styles.botaoPdf} onPress={handleCompartilhar}>
                <Text style={styles.botaoPdfTexto}>📤 Gerar e Compartilhar PDF</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f8' },
    content: { padding: 20, paddingBottom: 60 },
    headerRow: { marginBottom: 12 },
    btnVoltar: { alignSelf: 'flex-start', paddingVertical: 4, paddingRight: 12 },
    btnVoltarTexto: { color: '#0f3460', fontWeight: '700', fontSize: 14 },
    numero: { fontSize: 26, fontWeight: '800', color: '#0f3460', marginBottom: 8 },
    clienteBox: { marginBottom: 8 },
    clienteNome: { fontSize: 15, color: '#555', fontWeight: '500' },
    secao: { fontSize: 13, fontWeight: '700', color: '#888', marginTop: 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    statusRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    statusChip: {
        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
        borderWidth: 1.5, backgroundColor: '#fff',
    },
    statusChipTexto: { fontSize: 12, fontWeight: '600' },
    servicoCard: {
        backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8,
        flexDirection: 'row', alignItems: 'center',
    },
    servicoNome: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
    servicoQtd: { fontSize: 12, color: '#888', marginTop: 2 },
    servicoValor: { fontSize: 15, fontWeight: '700', color: '#0f3460' },
    resumoBox: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 8 },
    resumoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    resumoLabel: { fontSize: 14, color: '#555' },
    resumoValor: { fontSize: 14, color: '#333' },
    resumoTotal: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, marginTop: 4 },
    resumoTotalLabel: { fontSize: 16, fontWeight: '700', color: '#0f3460' },
    resumoTotalValor: { fontSize: 20, fontWeight: '800', color: '#0f3460' },
    semServicos: { fontSize: 14, color: '#aaa', textAlign: 'center', marginVertical: 20 },
    obsBox: { backgroundColor: '#fff', borderRadius: 12, padding: 14 },
    obsTexto: { fontSize: 14, color: '#555', lineHeight: 20 },
    botaoPdf: {
        backgroundColor: '#e94560', borderRadius: 14, paddingVertical: 16,
        alignItems: 'center', marginTop: 24,
    },
    botaoPdfTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
});