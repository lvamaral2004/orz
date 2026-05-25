import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f8',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#f0f2f8',
    },
    titulo: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0f3460',
        marginBottom: 4,
    },
    subtitulo: {
        fontSize: 14,
        color: '#888',
        marginBottom: 24,
    },
    cardsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        shadowColor: '#0f3460',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardPrimario: {
        backgroundColor: '#0f3460',
    },
    cardLucro: {
        backgroundColor: '#16213e',
    },
    cardLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    cardValor: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
    },
    cardValorDestaque: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0f3460',
    },
    erroTexto: {
        fontSize: 15,
        color: '#e94560',
        textAlign: 'center',
        marginBottom: 16,
    },
    botaoRecarregar: {
        backgroundColor: '#0f3460',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },
    botaoRecarregarTexto: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
});
