import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { ServicoRepository } from '../../repositories';
import { Servico } from '../../models';
import { Money } from '../../utils';

export function ServicosScreen() {
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
                        <Text style={styles.titulo}>Serviços</Text>
                        <Text style={styles.subtitulo}>{servicos.length} cadastrados</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.vazio}>Nenhum serviço cadastrado.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardTop}>
                            <Text style={styles.nome}>{item.nome}</Text>
                            <Text style={styles.preco}>{Money.format(item.precoVendaCentavos)}</Text>
                        </View>
                        {item.descricao && (
                            <Text style={styles.descricao}>{item.descricao}</Text>
                        )}
                        {item.tempoEstimadoMinutos && (
                            <Text style={styles.tempo}>⏱ {item.tempoEstimadoMinutos} min</Text>
                        )}
                        <Text style={styles.insumos}>
                            {item.insumos.length} insumo{item.insumos.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
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
    nome: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', flex: 1 },
    preco: { fontSize: 15, fontWeight: '700', color: '#0f3460' },
    descricao: { fontSize: 13, color: '#555', marginBottom: 6 },
    tempo: { fontSize: 12, color: '#888', marginBottom: 2 },
    insumos: { fontSize: 12, color: '#aaa' },
    vazio: { fontSize: 15, color: '#aaa', textAlign: 'center' },
});
