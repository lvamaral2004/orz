import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Pressable, Alert } from 'react-native';
import { ServicoRepository } from '../../repositories';
import { Servico } from '../../models';
import { Money } from '../../utils';
import { FormServico } from './FormServico';

type Mode = 'lista' | 'form';

export function ServicosScreen() {
    const [mode, setMode] = useState<Mode>('lista');
    const [servicoEditando, setServicoEditando] = useState<Servico | undefined>(undefined);
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [loading, setLoading] = useState(true);

    const carregar = useCallback(async () => {
        try {
            const repo = new ServicoRepository();
            const lista = await repo.findAll();
            setServicos(lista);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

    function abrirNovo() {
        setServicoEditando(undefined);
        setMode('form');
    }

    function abrirEditar(servico: Servico) {
        setServicoEditando(servico);
        setMode('form');
    }

    function handleSalvar() {
        setMode('lista');
        setLoading(true);
        carregar();
    }

    async function handleDeletar(servico: Servico) {
        Alert.alert(
            'Desativar Serviço',
            `Deseja desativar "${servico.nome}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Desativar', style: 'destructive',
                    onPress: async () => {
                        await new ServicoRepository().delete(servico.id);
                        carregar();
                    },
                },
            ]
        );
    }

    if (mode === 'form') {
        return (
            <FormServico
                servicoParaEditar={servicoEditando}
                onSalvar={handleSalvar}
                onCancelar={() => setMode('lista')}
            />
        );
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0f3460" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={servicos}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.lista}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.titulo}>Serviços</Text>
                            <Text style={styles.subtitulo}>{servicos.length} cadastrados</Text>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.centeredFlex}>
                        <Text style={styles.vazio}>Nenhum serviço cadastrado.</Text>
                        <Text style={styles.vazioSub}>Toque em + para adicionar.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable style={styles.card} onPress={() => abrirEditar(item)}>
                        <View style={styles.cardTop}>
                            <Text style={styles.nome}>{item.nome}</Text>
                            <Text style={styles.preco}>{Money.format(item.precoVendaCentavos)}</Text>
                        </View>
                        {item.descricao && (
                            <Text style={styles.descricao}>{item.descricao}</Text>
                        )}
                        <View style={styles.cardBottom}>
                            <View style={styles.infoRow}>
                                {item.tempoEstimadoMinutos && (
                                    <Text style={styles.tempo}>⏱ {item.tempoEstimadoMinutos} min</Text>
                                )}
                                <Text style={styles.insumos}>
                                    {item.insumos.length} insumo{item.insumos.length !== 1 ? 's' : ''}
                                </Text>
                            </View>
                            <Pressable onPress={() => handleDeletar(item)}>
                                <Text style={styles.deletar}>Desativar</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                )}
            />
            <Pressable style={styles.fab} onPress={abrirNovo}>
                <Text style={styles.fabTexto}>+</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f8' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    centeredFlex: { alignItems: 'center', justifyContent: 'center', padding: 24, marginTop: 40 },
    lista: { padding: 16, paddingBottom: 100 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    titulo: { fontSize: 28, fontWeight: '800', color: '#0f3460' },
    subtitulo: { fontSize: 13, color: '#888', marginTop: 2 },
    card: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
        shadowColor: '#0f3460', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
    infoRow: { flexDirection: 'row', gap: 12 },
    nome: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', flex: 1 },
    preco: { fontSize: 15, fontWeight: '700', color: '#0f3460' },
    descricao: { fontSize: 13, color: '#555', marginBottom: 6 },
    tempo: { fontSize: 12, color: '#888' },
    insumos: { fontSize: 12, color: '#aaa' },
    deletar: { fontSize: 12, color: '#e94560', fontWeight: '600' },
    vazio: { fontSize: 15, color: '#aaa', textAlign: 'center' },
    vazioSub: { fontSize: 13, color: '#ccc', textAlign: 'center', marginTop: 4 },
    fab: {
        position: 'absolute', bottom: 24, right: 24,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: '#0f3460', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#0f3460', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
    },
    fabTexto: { color: '#fff', fontSize: 28, lineHeight: 32, fontWeight: '300' },
});
