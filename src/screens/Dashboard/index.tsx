import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { OrcamentoRepository } from '../../repositories';
import { MargemService, ResultadoFinanceiro } from '../../services';
import { Money } from '../../utils';
import { Orcamento } from '../../models';
import { styles } from './styles';

interface DashboardData {
    totalFaturado: string;
    lucroTotal: string;
    margemMedia: string;
    totalOrcamentos: number;
    diagnostico: ResultadoFinanceiro['diagnostico'] | null;
}

export function DashboardScreen() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const carregar = useCallback(async () => {
        try {
            setErro(null);
            const repo = new OrcamentoRepository();
            const orcamentosDoMes: Orcamento[] = await repo.findByMonth(new Date());

            if (orcamentosDoMes.length === 0) {
                setData({
                    totalFaturado: Money.format(0),
                    lucroTotal: Money.format(0),
                    margemMedia: Money.formatPercent(0),
                    totalOrcamentos: 0,
                    diagnostico: null,
                });
                return;
            }

            const resultados = orcamentosDoMes.map((orc) =>
                MargemService.calcularResultado(orc)
            );

            const totalFaturado = resultados.reduce(
                (acc, r) => acc + r.faturamentoLiquidoCentavos, 0
            );
            const totalCusto = resultados.reduce(
                (acc, r) => acc + r.custoTotalInsumosCentavos, 0
            );
            const lucroTotal = totalFaturado - totalCusto;
            const margemMedia = totalFaturado > 0 ? (lucroTotal / totalFaturado) * 100 : 0;

            setData({
                totalFaturado: Money.format(totalFaturado),
                lucroTotal: Money.format(lucroTotal),
                margemMedia: Money.formatPercent(margemMedia),
                totalOrcamentos: orcamentosDoMes.length,
                diagnostico: resultados[0]?.diagnostico ?? null,
            });
        } catch (e) {
            setErro('Erro ao carregar o dashboard. Tente novamente.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        carregar();
    }, [carregar]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0f3460" />
            </View>
        );
    }

    if (erro) {
        return (
            <View style={styles.centered}>
                <Text style={styles.erroTexto}>{erro}</Text>
                <Pressable style={styles.botaoRecarregar} onPress={carregar}>
                    <Text style={styles.botaoRecarregarTexto}>Tentar novamente</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Text style={styles.titulo}>Dashboard</Text>
            <Text style={styles.subtitulo}>Resumo do mês atual</Text>

            <View style={styles.cardsRow}>
                <View style={[styles.card, styles.cardPrimario]}>
                    <Text style={styles.cardLabel}>Faturamento</Text>
                    <Text style={styles.cardValor}>{data?.totalFaturado ?? '—'}</Text>
                </View>
                <View style={[styles.card, styles.cardLucro]}>
                    <Text style={styles.cardLabel}>Lucro</Text>
                    <Text style={styles.cardValor}>{data?.lucroTotal ?? '—'}</Text>
                </View>
            </View>

            <View style={styles.cardsRow}>
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Margem Média</Text>
                    <Text style={styles.cardValorDestaque}>{data?.margemMedia ?? '—'}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Orçamentos</Text>
                    <Text style={styles.cardValorDestaque}>{data?.totalOrcamentos ?? 0}</Text>
                </View>
            </View>
        </ScrollView>
    );
}