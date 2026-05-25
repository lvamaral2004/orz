// Regra de ouro: NUNCA use float para dinheiro.
// Armazenamos em centavos (Integer) e convertemos apenas para exibição.

export const Money = {
    /** Converte reais (float) para centavos (integer) */
    toCents: (reais: number): number => Math.round(reais * 100),

    /** Converte centavos para reais */
    toReais: (centavos: number): number => centavos / 100,

    /** Formata centavos para exibição: R$ 1.250,00 */
    format: (centavos: number): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(centavos / 100);
    },

    /** Formata porcentagem com 2 casas decimais */
    formatPercent: (value: number): string => `${value.toFixed(2)}%`,
};