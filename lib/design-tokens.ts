/**
 * Design Tokens — Builders Performance v2
 *
 * Tokens tipados extraidos do design spec.
 * Referencia visual: ConstructHub dashboard (laranja coral, card-based, clean).
 *
 * Uso: importar tokens individuais ou o objeto completo `designTokens`.
 * Os valores CSS custom properties sao definidos em app/globals.css.
 */

// ---------------------------------------------------------------------------
// Cores
// ---------------------------------------------------------------------------

export const coresPrimarias = {
  primaria: '#F26B2A',
  primariaForeground: '#FFFFFF',
  primariaHover: '#D95A1F',
  primariaAtiva: '#C04F1A',
  primariaSuave: '#FEF0E8',
} as const;

export const coresNeutrasClaro = {
  fundo: '#F5F5F5',
  superficie: '#FFFFFF',
  superficieElevada: '#FFFFFF',
  borda: '#E8E8E8',
  bordaSutil: '#F0F0F0',
  textoPrimario: '#1A1A1A',
  textoSecundario: '#6B6B6B',
  textoTerciario: '#999999',
} as const;

export const coresNeutrasEscuro = {
  fundo: '#1A1A1A',
  superficie: '#242424',
  superficieElevada: '#2E2E2E',
  borda: '#333333',
  bordaSutil: '#2A2A2A',
  textoPrimario: '#F5F5F5',
  textoSecundario: '#A0A0A0',
  textoTerciario: '#666666',
} as const;

export const coresSemanticas = {
  sucesso: '#2ECC71',
  sucessoSuave: '#E8F8F0',
  perigo: '#E74C3C',
  perigoSuave: '#FDE8E6',
  aviso: '#F2C94C',
  avisoSuave: '#FEF9E7',
  info: '#3498DB',
  infoSuave: '#E8F4FD',
} as const;

export const coresSemanticasEscuro = {
  sucesso: '#2ECC71',
  sucessoSuave: '#1A2E22',
  perigo: '#E74C3C',
  perigoSuave: '#2E1A1A',
  aviso: '#F2C94C',
  avisoSuave: '#2E2A1A',
  info: '#3498DB',
  infoSuave: '#1A2430',
} as const;

export const coresGraficos = {
  grafico1: '#F26B2A',
  grafico2: '#2ECC71',
  grafico3: '#3498DB',
  grafico4: '#F2C94C',
  grafico5: '#9B59B6',
} as const;

export const coresSidebar = {
  claro: {
    fundo: '#FFFFFF',
    foreground: '#1A1A1A',
    primaria: '#F26B2A',
    primariaForeground: '#FFFFFF',
    accent: '#F26B2A',
    accentForeground: '#FFFFFF',
    borda: '#E8E8E8',
  },
  escuro: {
    fundo: '#1E1E1E',
    foreground: '#F5F5F5',
    primaria: '#F26B2A',
    primariaForeground: '#FFFFFF',
    accent: '#F26B2A',
    accentForeground: '#FFFFFF',
    borda: '#333333',
  },
} as const;

export const coresKanban = {
  prioridadeAlta: '#E74C3C',
  prioridadeAltaSuave: '#FDE8E6',
  prioridadeMedia: '#F2C94C',
  prioridadeMediaSuave: '#FEF9E7',
  prioridadeMediaTexto: '#B7950B',
  prioridadeBaixa: '#2ECC71',
  prioridadeBaixaSuave: '#E8F8F0',
  prioridadeBaixaTexto: '#27AE60',
} as const;

// ---------------------------------------------------------------------------
// Tipografia
// ---------------------------------------------------------------------------

export const fontes = {
  titulo: 'var(--fonte-titulo)',
  corpo: 'var(--fonte-corpo)',
} as const;

export const escalaTipografica = {
  tituloXl: { tamanho: '2rem', peso: '700', alturaLinha: '1.2' },
  tituloLg: { tamanho: '1.5rem', peso: '600', alturaLinha: '1.3' },
  tituloMd: { tamanho: '1.25rem', peso: '600', alturaLinha: '1.3' },
  tituloSm: { tamanho: '1rem', peso: '600', alturaLinha: '1.4' },
  corpoLg: { tamanho: '1rem', peso: '400', alturaLinha: '1.6' },
  corpoMd: { tamanho: '0.875rem', peso: '400', alturaLinha: '1.5' },
  corpoSm: { tamanho: '0.75rem', peso: '400', alturaLinha: '1.5' },
  corpoXs: { tamanho: '0.625rem', peso: '500', alturaLinha: '1.4' },
} as const;

// ---------------------------------------------------------------------------
// Espacamento
// ---------------------------------------------------------------------------

export const espacamento = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

// ---------------------------------------------------------------------------
// Arredondamento (Border Radius)
// ---------------------------------------------------------------------------

export const arredondamento = {
  sm: '12px',
  md: '14px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '28px',
  '4xl': '32px',
  full: '9999px',
} as const;

// ---------------------------------------------------------------------------
// Sombras
// ---------------------------------------------------------------------------

export const sombras = {
  nenhuma: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
  md: '0 2px 8px rgba(0, 0, 0, 0.06)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.08)',
  xl: '0 8px 32px rgba(0, 0, 0, 0.12)',
} as const;

// ---------------------------------------------------------------------------
// Transicoes
// ---------------------------------------------------------------------------

export const transicoes = {
  duracoes: {
    rapida: '100ms',
    normal: '200ms',
    lenta: '300ms',
    muitoLenta: '500ms',
  },
  easing: {
    padrao: 'cubic-bezier(0.4, 0, 0.2, 1)',
    entrada: 'cubic-bezier(0, 0, 0.2, 1)',
    saida: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

// ---------------------------------------------------------------------------
// Breakpoints
// ---------------------------------------------------------------------------

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export const layout = {
  containerMaxWidth: '1200px',
  paddingLateralMobile: '24px',
  paddingLateralDesktop: '32px',
  gapCardsMobile: '16px',
  gapCardsDesktop: '24px',
  sidebarAberta: '224px',
  sidebarFechada: '56px',
} as const;

// ---------------------------------------------------------------------------
// Icones
// ---------------------------------------------------------------------------

export const icones = {
  tamanhoPadrao: '16px',
  tamanhoGrande: '20px',
  tamanhoXl: '24px',
  strokeWidth: '1.5',
} as const;

// ---------------------------------------------------------------------------
// Token completo (exportacao consolidada)
// ---------------------------------------------------------------------------

export const designTokens = {
  cores: {
    primarias: coresPrimarias,
    neutrasClaro: coresNeutrasClaro,
    neutrasEscuro: coresNeutrasEscuro,
    semanticas: coresSemanticas,
    semanticasEscuro: coresSemanticasEscuro,
    graficos: coresGraficos,
    sidebar: coresSidebar,
    kanban: coresKanban,
  },
  tipografia: {
    fontes,
    escala: escalaTipografica,
  },
  espacamento,
  arredondamento,
  sombras,
  transicoes,
  breakpoints,
  layout,
  icones,
} as const;

// ---------------------------------------------------------------------------
// Tipos utilitarios
// ---------------------------------------------------------------------------

export type CoresPrimarias = typeof coresPrimarias;
export type CoresNeutras = typeof coresNeutrasClaro;
export type CoresSemanticas = typeof coresSemanticas;
export type CoresGraficos = typeof coresGraficos;
export type CoresKanban = typeof coresKanban;
export type EscalaTipografica = typeof escalaTipografica;
export type Espacamento = typeof espacamento;
export type Arredondamento = typeof arredondamento;
export type Sombras = typeof sombras;
export type Transicoes = typeof transicoes;
export type Breakpoints = typeof breakpoints;
export type Layout = typeof layout;
export type DesignTokens = typeof designTokens;
