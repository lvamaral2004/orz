import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, Pressable, StyleSheet,
    ScrollView, Alert, ActivityIndicator, FlatList,
} from 'react-native';
import { OrcamentoRepository, ServicoRepository, ClienteRepository } from '../../repositories';
import { Servico, OrcamentoCreate } from '../../models';
import { Money } from '../../utils';

interface ServicoSelecionado {
    servicoId: number;
    descricaoSnapshot: string;
    quantidade: number;
    precoVendaUnitarioCentavos: number;
    custoTotalCentavos: number;
}

interface Props {
    onSalvar: () => void;
    onCancelar: () => void;
}

function gerarNumero(): string {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    const rand = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `ORC-${ano}${mes}-${rand}`;
}

export function FormOrcamento({ onSalvar, onCancelar }: Props) {
    const [numero] = useState(gerarNumero());

    // Cliente
    const [clienteNome, setClienteNome] = useState('');
    const [clienteTelefone, setClienteTelefone] = useState('');
    const [validadeDias, setValidadeDias] = useState('15');
    const [observacoes, setObservacoes] = useState('');
    const [descontoTexto, setDescontoTexto] = useState('0');

    // Serviços
    const [servicosDisponiveis, setServicosDisponiveis] = useState<Servico[]>([]);
    const [servicosSelecionados, setServicosSelecionados] = useState<ServicoSelecionado[]>([]);
    const [mostrarPicker, setMostrarPicker] = useState(false);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        new ServicoRepository().findAll().then(setServicosDisponiveis).catch(() => {});
    }, []);

    function adicionarServico(servico: Servico) {
        const jaExiste = servicosSelecionados.find(s => s.servicoId === servico.id);
        if (jaExiste) {
            Alert.alert('Serviço já adicionado', 'Ajuste a quantidade diretamente na lista.');
            return;
        }
        // Calcular custo total dos insumos do serviço
        const custoInsumos = servico.insumos.reduce(
            (acc, i) => acc + i.precoCustoUnitarioCentavos * i.quantidade, 0
        );
        setServicosSelecionados(prev => [...prev, {
            servicoId: servico.id,
            descricaoSnapshot: servico.nome,
            quantidade: 1,
            precoVendaUnitarioCentavos: servico.precoVendaCentavos,
            custoTotalCentavos: custoInsumos,
        }]);
        setMostrarPicker(false);
    }

    function removerServico(servicoId: number) {
        setServicosSelecionados(prev => prev.filter(s => s.servicoId !== servicoId));
    }

    function alterarQuantidade(servicoId: number, qtd: string) {
        const valor = parseInt(qtd);
        if (!isNaN(valor) && valor > 0) {
            setServicosSelecionados(prev =>
                prev.map(s => s.servicoId === servicoId ? { ...s, quantidade: valor } : s)
            );
        }
    }

    const totalBrutoCentavos = servicosSelecionados.reduce(
        (acc, s) => acc + s.precoVendaUnitarioCentavos * s.quantidade, 0
    );
    const descontoCentavos = Money.toCents(parseFloat(descontoTexto.replace(',', '.')) || 0);
    const totalLiquidoCentavos = totalBrutoCentavos - descontoCentavos;

    async function handleSalvar() {
        if (servicosSelecionados.length === 0) {
            Alert.alert('Atenção', 'Adicione pelo menos um serviço ao orçamento.');
            return;
        }
        if (!clienteNome.trim()) {
            Alert.alert('Campo obrigatório', 'Informe o nome do cliente.');
            return;
        }

        try {
            setSalvando(true);
            const clienteRepo = new ClienteRepository();
            const clienteId = await clienteRepo.create({
                nome: clienteNome.trim(),
                telefone: clienteTelefone.trim() || undefined,
            });

            const data: OrcamentoCreate = {
                clienteId,
                numero,
                status: 'rascunho',
                validadeDias: parseInt(validadeDias) || 15,
                observacoes: observacoes.trim() || undefined,
                descontoCentavos,
            };

            const repo = new OrcamentoRepository();
            await repo.createComServicos(data, servicosSelecionados);
            onSalvar();
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível salvar o orçamento.');
        } finally {
            setSalvando(false);
        }
    }

    if (mostrarPicker) {
        return (
            <View style={styles.container}>
                <View style={styles.pickerHeader}>
                    <Text style={styles.titulo}>Selecionar Serviço</Text>
                    <Pressable onPress={() => setMostrarPicker(false)}>
                        <Text style={styles.fechar}>✕</Text>
                    </Pressable>
                </View>
                <FlatList
                    data={servicosDisponiveis}
                    keyExtractor={s => String(s.id)}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <Text style={styles.vazio}>Nenhum serviço cadastrado ainda.</Text>
                    }
                    renderItem={({ item }) => (
                        <Pressable style={styles.pickerItem} onPress={() => adicionarServico(item)}>
                            <Text style={styles.pickerItemNome}>{item.nome}</Text>
                            <Text style={styles.pickerItemPreco}>{Money.format(item.precoVendaCentavos)}</Text>
                        </Pressable>
                    )}
                />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.titulo}>Novo Orçamento</Text>

            {/* Número */}
            <View style={styles.numeroBox}>
                <Text style={styles.numeroLabel}>Número</Text>
                <Text style={styles.numeroValor}>{numero}</Text>
            </View>

            {/* Cliente */}
            <Text style={styles.secao}>👤 Dados do Cliente</Text>
            <Text style={styles.label}>Nome do Cliente *</Text>
            <TextInput style={styles.input} placeholder="Ex: João Silva" value={clienteNome} onChangeText={setClienteNome} placeholderTextColor="#bbb" />
            <Text style={styles.label}>Telefone</Text>
            <TextInput style={styles.input} placeholder="(11) 99999-9999" value={clienteTelefone} onChangeText={setClienteTelefone} keyboardType="phone-pad" placeholderTextColor="#bbb" />

            {/* Configurações */}
            <Text style={styles.secao}>⚙️ Configurações</Text>
            <Text style={styles.label}>Validade (dias)</Text>
            <TextInput style={styles.input} placeholder="15" value={validadeDias} onChangeText={setValidadeDias} keyboardType="number-pad" placeholderTextColor="#bbb" />
            <Text style={styles.label}>Observações</Text>
            <TextInput style={[styles.input, styles.inputMultiline]} placeholder="Condições, prazo de entrega..." value={observacoes} onChangeText={setObservacoes} multiline numberOfLines={3} placeholderTextColor="#bbb" />

            {/* Serviços */}
            <View style={styles.secaoHeader}>
                <Text style={styles.secao}>🔧 Serviços</Text>
                <Pressable style={styles.botaoAdicionar} onPress={() => setMostrarPicker(true)}>
                    <Text style={styles.botaoAdicionarTexto}>+ Adicionar</Text>
                </Pressable>
            </View>

            {servicosSelecionados.length === 0 ? (
                <Text style={styles.vazio}>Nenhum serviço adicionado.</Text>
            ) : (
                servicosSelecionados.map(s => (
                    <View key={s.servicoId} style={styles.servicoCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.servicoNome}>{s.descricaoSnapshot}</Text>
                            <Text style={styles.servicoPreco}>{Money.format(s.precoVendaUnitarioCentavos)} / un</Text>
                        </View>
                        <TextInput
                            style={styles.inputQtd}
                            value={String(s.quantidade)}
                            onChangeText={v => alterarQuantidade(s.servicoId, v)}
                            keyboardType="number-pad"
                            selectTextOnFocus
                        />
                        <Pressable onPress={() => removerServico(s.servicoId)} style={styles.btnRemover}>
                            <Text style={styles.btnRemoverTexto}>✕</Text>
                        </Pressable>
                    </View>
                ))
            )}

            {/* Desconto e Total */}
            {servicosSelecionados.length > 0 && (
                <View style={styles.totalBox}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValor}>{Money.format(totalBrutoCentavos)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Desconto (R$)</Text>
                        <TextInput
                            style={styles.inputDesconto}
                            value={descontoTexto}
                            onChangeText={setDescontoTexto}
                            keyboardType="decimal-pad"
                            selectTextOnFocus
                        />
                    </View>
                    <View style={[styles.totalRow, styles.totalFinal]}>
                        <Text style={styles.totalFinalLabel}>Total</Text>
                        <Text style={styles.totalFinalValor}>{Money.format(totalLiquidoCentavos)}</Text>
                    </View>
                </View>
            )}

            <View style={styles.acoes}>
                <Pressable style={styles.botaoCancelar} onPress={onCancelar}>
                    <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.botaoSalvar} onPress={handleSalvar} disabled={salvando}>
                    {salvando
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.botaoSalvarTexto}>Criar Orçamento</Text>
                    }
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f8' },
    content: { padding: 20, paddingBottom: 60 },
    titulo: { fontSize: 26, fontWeight: '800', color: '#0f3460', marginBottom: 16 },
    numeroBox: {
        backgroundColor: '#e8f0fe', borderRadius: 12, padding: 12,
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8,
    },
    numeroLabel: { fontSize: 12, color: '#0f3460', fontWeight: '600' },
    numeroValor: { fontSize: 13, fontWeight: '800', color: '#0f3460' },
    secao: { fontSize: 15, fontWeight: '700', color: '#0f3460', marginTop: 20, marginBottom: 4 },
    secaoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 4 },
    label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
    input: {
        backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14,
        paddingVertical: 12, fontSize: 15, color: '#1a1a2e', borderWidth: 1, borderColor: '#e0e0e0',
    },
    inputMultiline: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },
    botaoAdicionar: { backgroundColor: '#e8f0fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    botaoAdicionarTexto: { color: '#0f3460', fontWeight: '700', fontSize: 13 },
    servicoCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 12, padding: 12, marginBottom: 8, gap: 8,
    },
    servicoNome: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
    servicoPreco: { fontSize: 12, color: '#888', marginTop: 2 },
    inputQtd: {
        width: 56, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8,
        paddingHorizontal: 8, paddingVertical: 6, textAlign: 'center',
        fontSize: 15, backgroundColor: '#f8f8f8',
    },
    btnRemover: { padding: 4 },
    btnRemoverTexto: { color: '#e94560', fontSize: 16, fontWeight: '700' },
    totalBox: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 12 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    totalLabel: { fontSize: 14, color: '#555' },
    totalValor: { fontSize: 14, fontWeight: '600', color: '#333' },
    inputDesconto: {
        borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8,
        paddingHorizontal: 10, paddingVertical: 4, width: 100,
        textAlign: 'right', fontSize: 14,
    },
    totalFinal: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, marginTop: 4 },
    totalFinalLabel: { fontSize: 16, fontWeight: '700', color: '#0f3460' },
    totalFinalValor: { fontSize: 20, fontWeight: '800', color: '#0f3460' },
    vazio: { fontSize: 14, color: '#aaa', textAlign: 'center', marginVertical: 12 },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 8 },
    fechar: { fontSize: 22, color: '#888', fontWeight: '700' },
    pickerItem: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
    pickerItemNome: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
    pickerItemPreco: { fontSize: 14, fontWeight: '700', color: '#0f3460', marginTop: 2 },
    acoes: { flexDirection: 'row', gap: 12, marginTop: 32 },
    botaoCancelar: {
        flex: 1, paddingVertical: 14, borderRadius: 12,
        borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#fff',
    },
    botaoCancelarTexto: { color: '#555', fontWeight: '600', fontSize: 15 },
    botaoSalvar: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: '#0f3460', alignItems: 'center' },
    botaoSalvarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
