import React, { useState } from 'react';
import {
    View, Text, TextInput, Pressable, StyleSheet,
    ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useConfigStore } from '../../store/configStore';
import { supabase } from '../../supabase/client';

export function ConfiguracoesScreen() {
    const config = useConfigStore();

    const [nome, setNome] = useState(config.empresaNome);
    const [telefone, setTelefone] = useState(config.empresaTelefone);
    const [email, setEmail] = useState(config.empresaEmail);
    const [salvando, setSalvando] = useState(false);

    function handleSalvar() {
        setSalvando(true);
        config.setEmpresaNome(nome.trim() || 'Minha Empresa');
        config.setEmpresaTelefone(telefone.trim());
        config.setEmpresaEmail(email.trim());
        setTimeout(() => {
            setSalvando(false);
            Alert.alert('Salvo!', 'Configurações atualizadas com sucesso.');
        }, 300);
    }

    async function handleLogout() {
        Alert.alert(
            'Sair da Conta',
            'Deseja realmente sair da sua conta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        await supabase.auth.signOut();
                    }
                }
            ]
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.titulo}>Configurações</Text>
            <Text style={styles.subtitulo}>Dados que aparecem nos PDFs gerados</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Nome da Empresa</Text>
                <TextInput
                    style={styles.input}
                    value={nome}
                    onChangeText={setNome}
                    placeholder="Minha Empresa"
                    placeholderTextColor="#bbb"
                />

                <Text style={styles.label}>Telefone</Text>
                <TextInput
                    style={styles.input}
                    value={telefone}
                    onChangeText={setTelefone}
                    placeholder="(11) 99999-9999"
                    keyboardType="phone-pad"
                    placeholderTextColor="#bbb"
                />

                <Text style={styles.label}>E-mail</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="contato@empresa.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#bbb"
                />
            </View>

            <Pressable style={styles.botaoSalvar} onPress={handleSalvar} disabled={salvando}>
                {salvando
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.botaoSalvarTexto}>Salvar Configurações</Text>
                }
            </Pressable>

            <Pressable style={styles.botaoLogout} onPress={handleLogout}>
                <Text style={styles.botaoLogoutTexto}>Sair da Conta</Text>
            </Pressable>

            <View style={styles.infoBox}>
                <Text style={styles.infoTitulo}>ℹ️ Sobre o ORZ</Text>
                <Text style={styles.infoTexto}>
                    Sistema de orçamentos para profissionais autônomos.{'\n'}
                    Seus dados estão sincronizados na nuvem via Supabase.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f8' },
    content: { padding: 20, paddingBottom: 60 },
    titulo: { fontSize: 28, fontWeight: '800', color: '#0f3460', marginBottom: 4 },
    subtitulo: { fontSize: 13, color: '#888', marginBottom: 24 },
    card: {
        backgroundColor: '#fff', borderRadius: 16, padding: 20,
        shadowColor: '#0f3460', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07, shadowRadius: 8, elevation: 2, marginBottom: 20,
    },
    label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 16 },
    input: {
        backgroundColor: '#f8f8f8', borderRadius: 12, paddingHorizontal: 14,
        paddingVertical: 12, fontSize: 15, color: '#1a1a2e',
        borderWidth: 1, borderColor: '#e8e8e8',
    },
    botaoSalvar: {
        backgroundColor: '#0f3460', borderRadius: 14, paddingVertical: 16,
        alignItems: 'center', marginBottom: 12,
    },
    botaoSalvarTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
    botaoLogout: {
        backgroundColor: '#fee2e2', borderRadius: 14, paddingVertical: 16,
        alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#fca5a5',
    },
    botaoLogoutTexto: { color: '#b91c1c', fontWeight: '700', fontSize: 16 },
    infoBox: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16,
        borderLeftWidth: 3, borderLeftColor: '#0f3460',
    },
    infoTitulo: { fontSize: 14, fontWeight: '700', color: '#0f3460', marginBottom: 8 },
    infoTexto: { fontSize: 13, color: '#666', lineHeight: 20 },
});
