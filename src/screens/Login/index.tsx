import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { supabase } from '../../supabase/client';

export function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

    async function handleAuth() {
        if (!email.trim() || !password.trim()) {
            setMensagem({ tipo: 'erro', texto: 'Por favor, preencha todos os campos.' });
            return;
        }

        setLoading(true);
        setMensagem(null);

        try {
            if (isSignUp) {
                const { error, data } = await supabase.auth.signUp({
                    email: email.trim(),
                    password: password.trim(),
                });

                if (error) throw error;

                // Se o Supabase está configurado para AUTO-CONFIRM (sem validação de e-mail por enquanto)
                if (data.session) {
                    setMensagem({ tipo: 'sucesso', texto: 'Conta criada e logada com sucesso!' });
                } else {
                    setMensagem({ tipo: 'sucesso', texto: 'Conta criada! Se necessário, confirme no seu e-mail.' });
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password: password.trim(),
                });

                if (error) throw error;
            }
        } catch (error: any) {
            setMensagem({ tipo: 'erro', texto: error.message || 'Ocorreu um erro ao autenticar.' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.logo}>📊 ORZ</Text>
                    <Text style={styles.subtitulo}>Orçamentos Fáceis & Gestão Eficiente</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.tituloCard}>
                        {isSignUp ? 'Criar Nova Conta' : 'Entrar no Sistema'}
                    </Text>

                    {mensagem && (
                        <View style={[
                            styles.mensagemBox,
                            mensagem.tipo === 'erro' ? styles.mensagemErro : styles.mensagemSucesso
                        ]}>
                            <Text style={[
                                styles.mensagemTexto,
                                mensagem.tipo === 'erro' ? styles.mensagemTextoErro : styles.mensagemTextoSucesso
                            ]}>
                                {mensagem.texto}
                            </Text>
                        </View>
                    )}

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>E-mail</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="seuemail@exemplo.com"
                            placeholderTextColor="#aaa"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Senha</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Sua senha secreta"
                            placeholderTextColor="#aaa"
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <Pressable
                        style={styles.botaoPrincipal}
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.botaoPrincipalTexto}>
                                {isSignUp ? 'Cadastrar' : 'Entrar'}
                            </Text>
                        )}
                    </Pressable>

                    <Pressable
                        style={styles.botaoAlternar}
                        onPress={() => {
                            setIsSignUp(!isSignUp);
                            setMensagem(null);
                        }}
                    >
                        <Text style={styles.botaoAlternarTexto}>
                            {isSignUp
                                ? 'Já possui uma conta? Faça Login'
                                : 'Ainda não tem conta? Cadastre-se'}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f3460', // deep blue
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        fontSize: 42,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 8,
    },
    subtitulo: {
        fontSize: 14,
        color: '#e6f4fe',
        opacity: 0.8,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    tituloCard: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0f3460',
        marginBottom: 20,
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#0f3460',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#f5f7fb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#16213e',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    botaoPrincipal: {
        backgroundColor: '#0f3460',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#0f3460',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    botaoPrincipalTexto: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    botaoAlternar: {
        alignItems: 'center',
        marginTop: 20,
        padding: 4,
    },
    botaoAlternarTexto: {
        color: '#0f3460',
        fontSize: 13,
        fontWeight: '600',
    },
    mensagemBox: {
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    mensagemErro: {
        backgroundColor: '#fee2e2',
        borderWidth: 1,
        borderColor: '#fca5a5',
    },
    mensagemSucesso: {
        backgroundColor: '#dcfce7',
        borderWidth: 1,
        borderColor: '#86efac',
    },
    mensagemTexto: {
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '500',
    },
    mensagemTextoErro: {
        color: '#b91c1c',
    },
    mensagemTextoSucesso: {
        color: '#15803d',
    },
});
