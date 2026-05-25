import { create } from 'zustand';

interface ConfigState {
    empresaNome: string;
    empresaTelefone: string;
    empresaEmail: string;
    logoBase64: string;

    setEmpresaNome: (nome: string) => void;
    setEmpresaTelefone: (telefone: string) => void;
    setEmpresaEmail: (email: string) => void;
    setLogoBase64: (logo: string) => void;
    resetConfig: () => void;
}

const defaultState = {
    empresaNome: 'Minha Empresa',
    empresaTelefone: '',
    empresaEmail: '',
    logoBase64: '',
};

export const useConfigStore = create<ConfigState>((set) => ({
    ...defaultState,

    setEmpresaNome: (nome) => set({ empresaNome: nome }),
    setEmpresaTelefone: (telefone) => set({ empresaTelefone: telefone }),
    setEmpresaEmail: (email) => set({ empresaEmail: email }),
    setLogoBase64: (logo) => set({ logoBase64: logo }),
    resetConfig: () => set(defaultState),
}));
