import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { InsumoRepository } from '../../repositories';
import { Insumo } from '../../models';
import { Money } from '../../utils';

export function InsumosScreen() {
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [loading, setLoading] = useState(true);

    const carregar = useCallback(async () => {
        try {
            const repo = new InsumoRepository();
            const lista = await repo.findAll();
            setInsumos(lista);
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
                data={insumos}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.lista}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.titulo}>Insumos</Text>
                        <Text style={styles.subtitulo}>{insumos.length} cadastrados</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.vazio}>Nenhum insumo cadastrado.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardTop}>
                            <Text style={styles.nome}>{item.nome}</Text>
                            <Text style={styles.preco}>{Money.format(item.precoCustoCentavos)}</Text>
                        </View>
                        {item.categoria && (
                            <View style={styles.categoriaTag}>
                                <Text style={styles.categoriaTexto}>{item.categoria}</Text>
                            </View>
                        )}
                        <Text style={styles.unidade}>Unidade: {item.unidade}</Text>
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
    categoriaTag: {
        alignSelf: 'flex-start',
        backgroundColor: '#e8f0fe',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 2,
        marginBottom: 4,
    },
    categoriaTexto: { fontSize: 11, color: '#0f3460', fontWeight: '600' },
    unidade: { fontSize: 12, color: '#aaa' },
    vazio: { fontSize: 15, color: '#aaa', textAlign: 'center' },
});
