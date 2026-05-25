import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { PdfService } from '../../services';
import { useConfigStore } from '../../store/configStore';
import { Orcamento, Cliente } from '../../models';

interface Props {
    orcamento: Orcamento;
    cliente?: Cliente;
}

export function DetalhesOrcamento({ orcamento, cliente }: Props) {
    const config = useConfigStore();

    async function handleCompartilhar() {
        try {
            await PdfService.gerarECompartilhar({
                orcamento,
                cliente,
                empresaNome: config.empresaNome,
                empresaTelefone: config.empresaTelefone,
                empresaEmail: config.empresaEmail,
                logoBase64: config.logoBase64,
            });
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível gerar o PDF. Tente novamente.');
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.numero}>{orcamento.numero}</Text>
            <Text style={styles.status}>Status: {orcamento.status}</Text>

            {cliente && (
                <View style={styles.clienteBox}>
                    <Text style={styles.clienteNome}>{cliente.nome}</Text>
                    {cliente.telefone && <Text style={styles.clienteInfo}>📞 {cliente.telefone}</Text>}
                    {cliente.email && <Text style={styles.clienteInfo}>✉️ {cliente.email}</Text>}
                </View>
            )}

            <Pressable style={styles.botao} onPress={handleCompartilhar}>
                <Text style={styles.botaoTexto}>📤 Compartilhar PDF</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f8', padding: 20 },
    numero: { fontSize: 24, fontWeight: '800', color: '#0f3460', marginBottom: 4 },
    status: { fontSize: 14, color: '#888', marginBottom: 20 },
    clienteBox: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#0f3460',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
    },
    clienteNome: { fontSize: 16, fontWeight: '700', color: '#0f3460', marginBottom: 6 },
    clienteInfo: { fontSize: 14, color: '#555', marginTop: 2 },
    botao: {
        backgroundColor: '#e94560',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
});