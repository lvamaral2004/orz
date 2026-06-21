import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, Pressable, StyleSheet,
    ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { InsumoRepository } from '../../repositories';
import { Insumo, InsumoCreate } from '../../models';
import { Money } from '../../utils';

type Unidade = Insumo['unidade'];
const UNIDADES: Unidade[] = ['un', 'kg', 'l', 'h', 'm', 'cx'];
const CATEGORIAS = ['Material', 'Mão de Obra', 'Ferramenta', 'Outro'];

interface Props {
    insumoParaEditar?: Insumo;
    onSalvar: () => void;
    onCancelar: () => void;
}

export function FormInsumo({ insumoParaEditar, onSalvar, onCancelar }: Props) {
    const editando = !!insumoParaEditar;

    const [nome, setNome] = useState(insumoParaEditar?.nome ?? '');
    const [descricao, setDescricao] = useState(insumoParaEditar?.descricao ?? '');
    const [unidade, setUnidade] = useState<Unidade>(insumoParaEditar?.unidade ?? 'un');
    const [precoTexto, setPrecoTexto] = useState(
        insumoParaEditar ? String(Money.toReais(insumoParaEditar.precoCustoCentavos)) : ''
    );
    const [categoria, setCategoria] = useState(insumoParaEditar?.categoria ?? '');
    const [salvando, setSalvando] = useState(false);

    async function handleSalvar() {
        if (!nome.trim()) {
            Alert.alert('Campo obrigatório', 'Informe o nome do insumo.');
            return;
        }
        const preco = parseFloat(precoTexto.replace(',', '.'));
        if (isNaN(preco) || preco < 0) {
            Alert.alert('Preço inválido', 'Informe um preço de custo válido.');
            return;
        }

        const data: InsumoCreate = {
            nome: nome.trim(),
            descricao: descricao.trim() || undefined,
            unidade,
            precoCustoCentavos: Money.toCents(preco),
            categoria: categoria || undefined,
            ativo: true,
        };

        try {
            setSalvando(true);
            const repo = new InsumoRepository();
            if (editando && insumoParaEditar) {
                await repo.update(insumoParaEditar.id, data);
            } else {
                await repo.create(data);
            }
            onSalvar();
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível salvar o insumo.');
        } finally {
            setSalvando(false);
        }
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.titulo}>{editando ? 'Editar Insumo' : 'Novo Insumo'}</Text>

            {/* Nome */}
            <Text style={styles.label}>Nome *</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: Parafuso M6"
                value={nome}
                onChangeText={setNome}
                placeholderTextColor="#bbb"
            />

            {/* Descrição */}
            <Text style={styles.label}>Descrição</Text>
            <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Descrição opcional"
                value={descricao}
                onChangeText={setDescricao}
                multiline
                numberOfLines={3}
                placeholderTextColor="#bbb"
            />

            {/* Preço de custo */}
            <Text style={styles.label}>Preço de Custo (R$) *</Text>
            <TextInput
                style={styles.input}
                placeholder="0,00"
                value={precoTexto}
                onChangeText={setPrecoTexto}
                keyboardType="decimal-pad"
                placeholderTextColor="#bbb"
            />

            {/* Unidade */}
            <Text style={styles.label}>Unidade</Text>
            <View style={styles.pickerRow}>
                {UNIDADES.map((u) => (
                    <Pressable
                        key={u}
                        style={[styles.chip, unidade === u && styles.chipSelecionado]}
                        onPress={() => setUnidade(u)}
                    >
                        <Text style={[styles.chipTexto, unidade === u && styles.chipTextoSelecionado]}>
                            {u}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Categoria */}
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.pickerRow}>
                {CATEGORIAS.map((c) => (
                    <Pressable
                        key={c}
                        style={[styles.chip, categoria === c && styles.chipSelecionado]}
                        onPress={() => setCategoria(prev => prev === c ? '' : c)}
                    >
                        <Text style={[styles.chipTexto, categoria === c && styles.chipTextoSelecionado]}>
                            {c}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Ações */}
            <View style={styles.acoes}>
                <Pressable style={styles.botaoCancelar} onPress={onCancelar}>
                    <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.botaoSalvar} onPress={handleSalvar} disabled={salvando}>
                    {salvando
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.botaoSalvarTexto}>{editando ? 'Salvar Alterações' : 'Criar Insumo'}</Text>
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
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1a1a2e',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputMultiline: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },
    pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    chipSelecionado: { backgroundColor: '#0f3460', borderColor: '#0f3460' },
    chipTexto: { fontSize: 13, color: '#555', fontWeight: '500' },
    chipTextoSelecionado: { color: '#fff', fontWeight: '700' },
    acoes: { flexDirection: 'row', gap: 12, marginTop: 32 },
    botaoCancelar: {
        flex: 1, paddingVertical: 14, borderRadius: 12,
        borderWidth: 1, borderColor: '#ddd', alignItems: 'center',
        backgroundColor: '#fff',
    },
    botaoCancelarTexto: { color: '#555', fontWeight: '600', fontSize: 15 },
    botaoSalvar: {
        flex: 2, paddingVertical: 14, borderRadius: 12,
        backgroundColor: '#0f3460', alignItems: 'center',
    },
    botaoSalvarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
