import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { OrcamentoRepository } from '../../repositories';
import { Orcamento } from '../../models';
import { Money } from '../../utils';

const STATUS_CORES: Record<Orcamento['status'], string> = {
    rascunho: '#888',
    enviado: '#f59e0b',
    aprovado: '#10b981',
    recusado: '#e94560',
};

export function OrcamentosScreen() {
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
    const [loading, setLoading] = useState(true);

    const carregar = useCallback(async () => {
        try {
            const repo = new OrcamentoRepository();
            const lista = await repo.findAll();
            setOrcamentos(lista);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

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
                data={orcamentos}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.lista}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.titulo}>Orçamentos</Text>
                        <Text style={styles.subtitulo}>{orcamentos.length} no total</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.vazio}>Nenhum orçamento ainda.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable style={styles.card}>
                        <View style={styles.cardTop}>
                            <Text style={styles.numero}>{item.numero}</Text>
                            <View style={[styles.badge, { backgroundColor: STATUS_CORES[item.status] }]}>
                                <Text style={styles.badgeTexto}>{item.status}</Text>
                            </View>
                        </View>
                        {item.clienteNome && (
                            <Text style={styles.cliente}>{item.clienteNome}</Text>
                        )}
                        <Text style={styles.data}>
                            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                        </Text>
                    </Pressable>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f8' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    lista: { padding: 16, paddingBottom: 40 },
    header: { marginBottom: 16 },
    titulo: { fontSize: 28, fontWeight: '800', color: '#0f3460' },
    subtitulo: { fontSize: 13, color: '#888', marginTop: 2 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#0f3460',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    numero: { fontSize: 16, fontWeight: '700', color: '#0f3460' },
    badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
    badgeTexto: { color: '#fff', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
    cliente: { fontSize: 14, color: '#333', marginBottom: 4 },
    data: { fontSize: 12, color: '#aaa' },
    vazio: { fontSize: 15, color: '#aaa', textAlign: 'center' },
});
