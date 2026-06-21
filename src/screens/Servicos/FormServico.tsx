import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, Pressable, StyleSheet,
    ScrollView, Alert, ActivityIndicator, FlatList,
} from 'react-native';
import { ServicoRepository, InsumoRepository } from '../../repositories';
import { Servico, ServicoCreate, Insumo } from '../../models';
import { Money } from '../../utils';
import { MargemService } from '../../services';

interface InsumoSelecionado {
    insumoId: number;
    insumoNome: string;
    quantidade: number;
    precoCustoUnitarioCentavos: number;
}

interface Props {
    servicoParaEditar?: Servico;
    onSalvar: () => void;
    onCancelar: () => void;
}

export function FormServico({ servicoParaEditar, onSalvar, onCancelar }: Props) {
    const editando = !!servicoParaEditar;

    const [nome, setNome] = useState(servicoParaEditar?.nome ?? '');
    const [descricao, setDescricao] = useState(servicoParaEditar?.descricao ?? '');
    const [precoVendaTexto, setPrecoVendaTexto] = useState(
        servicoParaEditar ? String(Money.toReais(servicoParaEditar.precoVendaCentavos)) : ''
    );
    const [tempoTexto, setTempoTexto] = useState(
        servicoParaEditar?.tempoEstimadoMinutos ? String(servicoParaEditar.tempoEstimadoMinutos) : ''
    );

    const [insumosSelecionados, setInsumosSelecionados] = useState<InsumoSelecionado[]>(
        servicoParaEditar?.insumos.map(i => ({
            insumoId: i.insumoId,
            insumoNome: i.insumoNome,
            quantidade: i.quantidade,
            precoCustoUnitarioCentavos: i.precoCustoUnitarioCentavos,
        })) ?? []
    );

    const [insunosDisponiveis, setInsumosDisponiveis] = useState<Insumo[]>([]);
    const [mostrarPicker, setMostrarPicker] = useState(false);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        new InsumoRepository().findAll().then(setInsumosDisponiveis).catch(() => {});
    }, []);

    const custoTotalCentavos = MargemService.calcularCustoServico(insumosSelecionados);

    function adicionarInsumo(insumo: Insumo) {
        const jaExiste = insumosSelecionados.find(i => i.insumoId === insumo.id);
        if (jaExiste) {
            Alert.alert('Insumo já adicionado', 'Ajuste a quantidade diretamente na lista.');
            return;
        }
        setInsumosSelecionados(prev => [...prev, {
            insumoId: insumo.id,
            insumoNome: insumo.nome,
            quantidade: 1,
            precoCustoUnitarioCentavos: insumo.precoCustoCentavos,
        }]);
        setMostrarPicker(false);
    }

    function removerInsumo(insumoId: number) {
        setInsumosSelecionados(prev => prev.filter(i => i.insumoId !== insumoId));
    }

    function alterarQuantidade(insumoId: number, qtd: string) {
        const valor = parseFloat(qtd.replace(',', '.'));
        if (!isNaN(valor) && valor > 0) {
            setInsumosSelecionados(prev =>
                prev.map(i => i.insumoId === insumoId ? { ...i, quantidade: valor } : i)
            );
        }
    }

    async function handleSalvar() {
        if (!nome.trim()) {
            Alert.alert('Campo obrigatório', 'Informe o nome do serviço.');
            return;
        }
        const precoVenda = parseFloat(precoVendaTexto.replace(',', '.'));
        if (isNaN(precoVenda) || precoVenda < 0) {
            Alert.alert('Preço inválido', 'Informe um preço de venda válido.');
            return;
        }

        const data: ServicoCreate = {
            nome: nome.trim(),
            descricao: descricao.trim() || undefined,
            precoVendaCentavos: Money.toCents(precoVenda),
            tempoEstimadoMinutos: tempoTexto ? parseInt(tempoTexto) : undefined,
            ativo: true,
        };

        try {
            setSalvando(true);
            const repo = new ServicoRepository();
            if (editando && servicoParaEditar) {
                await repo.update(servicoParaEditar.id, data);
                await repo.updateInsumos(servicoParaEditar.id, insumosSelecionados);
            } else {
                await repo.createComInsumos(data, insumosSelecionados);
            }
            onSalvar();
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível salvar o serviço.');
        } finally {
            setSalvando(false);
        }
    }

    if (mostrarPicker) {
        return (
            <View style={styles.container}>
                <View style={styles.pickerHeader}>
                    <Text style={styles.titulo}>Selecionar Insumo</Text>
                    <Pressable onPress={() => setMostrarPicker(false)}>
                        <Text style={styles.fechar}>✕</Text>
                    </Pressable>
                </View>
                <FlatList
                    data={insunosDisponiveis}
                    keyExtractor={i => String(i.id)}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <Text style={styles.vazio}>Nenhum insumo cadastrado.</Text>
                    }
                    renderItem={({ item }) => (
                        <Pressable style={styles.pickerItem} onPress={() => adicionarInsumo(item)}>
                            <Text style={styles.pickerItemNome}>{item.nome}</Text>
                            <Text style={styles.pickerItemPreco}>
                                {Money.format(item.precoCustoCentavos)} / {item.unidade}
                            </Text>
                        </Pressable>
                    )}
                />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.titulo}>{editando ? 'Editar Serviço' : 'Novo Serviço'}</Text>

            <Text style={styles.label}>Nome *</Text>
            <TextInput style={styles.input} placeholder="Ex: Instalação elétrica" value={nome} onChangeText={setNome} placeholderTextColor="#bbb" />

            <Text style={styles.label}>Descrição</Text>
            <TextInput style={[styles.input, styles.inputMultiline]} placeholder="Descrição opcional" value={descricao} onChangeText={setDescricao} multiline numberOfLines={3} placeholderTextColor="#bbb" />

            <Text style={styles.label}>Preço de Venda (R$) *</Text>
            <TextInput style={styles.input} placeholder="0,00" value={precoVendaTexto} onChangeText={setPrecoVendaTexto} keyboardType="decimal-pad" placeholderTextColor="#bbb" />

            <Text style={styles.label}>Tempo Estimado (minutos)</Text>
            <TextInput style={styles.input} placeholder="Ex: 120" value={tempoTexto} onChangeText={setTempoTexto} keyboardType="number-pad" placeholderTextColor="#bbb" />

            {/* Insumos */}
            <View style={styles.secaoHeader}>
                <Text style={styles.label}>Insumos</Text>
                <Pressable style={styles.botaoAdicionar} onPress={() => setMostrarPicker(true)}>
                    <Text style={styles.botaoAdicionarTexto}>+ Adicionar</Text>
                </Pressable>
            </View>

            {insumosSelecionados.length === 0 ? (
                <Text style={styles.vazio}>Nenhum insumo adicionado.</Text>
            ) : (
                insumosSelecionados.map(i => (
                    <View key={i.insumoId} style={styles.insumoCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.insumoNome}>{i.insumoNome}</Text>
                            <Text style={styles.insumoPreco}>
                                {Money.format(i.precoCustoUnitarioCentavos)} / un
                            </Text>
                        </View>
                        <TextInput
                            style={styles.inputQtd}
                            value={String(i.quantidade)}
                            onChangeText={v => alterarQuantidade(i.insumoId, v)}
                            keyboardType="decimal-pad"
                            selectTextOnFocus
                        />
                        <Pressable onPress={() => removerInsumo(i.insumoId)} style={styles.btnRemover}>
                            <Text style={styles.btnRemoverTexto}>✕</Text>
                        </Pressable>
                    </View>
                ))
            )}

            {insumosSelecionados.length > 0 && (
                <View style={styles.custoBox}>
                    <Text style={styles.custoLabel}>Custo total dos insumos</Text>
                    <Text style={styles.custoValor}>{Money.format(custoTotalCentavos)}</Text>
                </View>
            )}

            <View style={styles.acoes}>
                <Pressable style={styles.botaoCancelar} onPress={onCancelar}>
                    <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.botaoSalvar} onPress={handleSalvar} disabled={salvando}>
                    {salvando
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.botaoSalvarTexto}>{editando ? 'Salvar Alterações' : 'Criar Serviço'}</Text>
                    }
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f8' },
    content: { padding: 20, paddingBottom: 60 },
    titulo: { fontSize: 26, fontWeight: '800', color: '#0f3460', marginBottom: 24 },
    label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 16 },
    input: {
        backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14,
        paddingVertical: 12, fontSize: 15, color: '#1a1a2e', borderWidth: 1, borderColor: '#e0e0e0',
    },
    inputMultiline: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },
    secaoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 },
    botaoAdicionar: { backgroundColor: '#e8f0fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    botaoAdicionarTexto: { color: '#0f3460', fontWeight: '700', fontSize: 13 },
    insumoCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 12, padding: 12, marginBottom: 8, gap: 8,
    },
    insumoNome: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
    insumoPreco: { fontSize: 12, color: '#888', marginTop: 2 },
    inputQtd: {
        width: 56, borderWidth: 1, borderColor: '#e0e0e0',
        borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6,
        textAlign: 'center', fontSize: 15, backgroundColor: '#f8f8f8',
    },
    btnRemover: { padding: 4 },
    btnRemoverTexto: { color: '#e94560', fontSize: 16, fontWeight: '700' },
    custoBox: {
        backgroundColor: '#e8f0fe', borderRadius: 12, padding: 14, marginTop: 4,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    custoLabel: { fontSize: 13, color: '#0f3460', fontWeight: '600' },
    custoValor: { fontSize: 16, fontWeight: '800', color: '#0f3460' },
    vazio: { fontSize: 14, color: '#aaa', textAlign: 'center', marginVertical: 12 },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 8 },
    fechar: { fontSize: 22, color: '#888', fontWeight: '700' },
    pickerItem: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
    pickerItemNome: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
    pickerItemPreco: { fontSize: 13, color: '#888', marginTop: 2 },
    acoes: { flexDirection: 'row', gap: 12, marginTop: 32 },
    botaoCancelar: {
        flex: 1, paddingVertical: 14, borderRadius: 12,
        borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#fff',
    },
    botaoCancelarTexto: { color: '#555', fontWeight: '600', fontSize: 15 },
    botaoSalvar: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: '#0f3460', alignItems: 'center' },
    botaoSalvarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
