"use client";

import * as React from "react";
import Image from "next/image";
import {
  Camera,
  Check,
  Loader2,
  Mail,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { Botao } from "@/componentes/ui/botao";
import { AnimacaoPagina, SecaoAnimada } from "@/componentes/ui/animacoes";
import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao";
import { Emblema } from "@/componentes/ui/emblema";
import { Alternador } from "@/componentes/ui/alternador";
import { cn } from "@/lib/utilidades";
import { useAuth } from "@/lib/providers/auth-provider";
import {
  useUpdatePerfil,
  useAlterarSenha,
  useUploadAvatar,
  useRemoverAvatar,
} from "@/hooks/usePerfil";

export default function PaginaPerfil() {
  const { user } = useAuth();
  const updatePerfil = useUpdatePerfil();
  const alterarSenha = useAlterarSenha();
  const uploadAvatar = useUploadAvatar();
  const removerAvatar = useRemoverAvatar();

  const nomeUsuario =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuário";
  const emailUsuario = user?.email || "";
  const avatarUrl = user?.user_metadata?.avatar_url || null;
  const iniciaisUsuario = nomeUsuario
    .split(" ")
    .map((parte: string) => parte[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [nome, setNome] = React.useState(nomeUsuario);
  const [email, setEmail] = React.useState(emailUsuario);
  const [senhaNova, setSenhaNova] = React.useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = React.useState("");
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [arquivoSelecionado, setArquivoSelecionado] =
    React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [preferencias, setPreferencias] = React.useState({
    notificacoesEmail: true,
    lembretesFoco: true,
    resumoSemanal: false,
    atualizacoesCursos: true,
  });

  React.useEffect(() => {
    if (emailUsuario) {
      setEmail(emailUsuario);
    }
  }, [emailUsuario]);

  React.useEffect(() => {
    if (nomeUsuario) {
      setNome(nomeUsuario);
    }
  }, [nomeUsuario]);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const senhaFoiDigitada =
    senhaNova.trim().length > 0 || senhaConfirmacao.trim().length > 0;
  const senhasConferem =
    senhaNova.trim().length >= 6 &&
    senhaNova.trim() === senhaConfirmacao.trim();

  const alternarPreferencia = (chave: keyof typeof preferencias) => {
    setPreferencias((estado) => ({ ...estado, [chave]: !estado[chave] }));
  };

  const handleSalvarInfo = () => {
    updatePerfil.mutate({ name: nome });
  };

  const handleAlterarSenha = () => {
    alterarSenha.mutate(
      { novaSenha: senhaNova, confirmacao: senhaConfirmacao },
      {
        onSuccess: () => {
          setSenhaNova("");
          setSenhaConfirmacao("");
        },
      }
    );
  };

  const handleSelecionarArquivo = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    setArquivoSelecionado(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSalvarFoto = () => {
    if (!arquivoSelecionado) return;
    uploadAvatar.mutate(arquivoSelecionado, {
      onSuccess: () => {
        setArquivoSelecionado(null);
        setPreviewUrl(null);
      },
    });
  };

  const handleRemoverFoto = () => {
    removerAvatar.mutate(undefined, {
      onSuccess: () => {
        setPreviewUrl(null);
        setArquivoSelecionado(null);
      },
    });
  };

  const temFoto = Boolean(avatarUrl) || Boolean(previewUrl);
  const fotoExibida = previewUrl || avatarUrl;

  const itensPreferencias = [
    {
      id: "notificacoesEmail" as const,
      titulo: "Notificações por email",
      descricao: "Receba alertas importantes sobre tarefas e metas.",
    },
    {
      id: "lembretesFoco" as const,
      titulo: "Lembretes do modo foco",
      descricao: "Seja avisado antes do início das sessões.",
    },
    {
      id: "resumoSemanal" as const,
      titulo: "Resumo semanal",
      descricao: "Envio automático do seu desempenho na semana.",
    },
    {
      id: "atualizacoesCursos" as const,
      titulo: "Atualizações de cursos",
      descricao: "Novas aulas e trilhas recomendadas.",
    },
  ];

  return (
    <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
      <AnimacaoPagina className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
        <SecaoAnimada className="flex items-center gap-3">
          <div>
            <h1 className="font-titulo text-2xl font-semibold">Perfil</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie suas informações e preferências.
            </p>
          </div>
        </SecaoAnimada>

        <SecaoAnimada className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="order-2 space-y-6 lg:order-1">
            {/* Informações pessoais */}
            <Cartao>
              <CartaoCabecalho>
                <CartaoTitulo className="text-base">
                  Informações pessoais
                </CartaoTitulo>
                <CartaoDescricao>
                  Atualize seus dados principais.
                </CartaoDescricao>
              </CartaoCabecalho>
              <CartaoConteudo className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="nome">
                      Nome completo
                    </label>
                    <input
                      id="nome"
                      value={nome}
                      onChange={(event) => setNome(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="email">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <p
                      className={cn(
                        "text-xs",
                        emailValido ? "text-emerald-600" : "text-destructive"
                      )}
                    >
                      {emailValido
                        ? "Email válido."
                        : "Informe um email válido."}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Botao
                    variant="secondary"
                    onClick={handleSalvarInfo}
                    disabled={updatePerfil.isPending}
                  >
                    {updatePerfil.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Salvar alterações
                  </Botao>
                </div>
              </CartaoConteudo>
            </Cartao>

            {/* Segurança */}
            <Cartao>
              <CartaoCabecalho>
                <CartaoTitulo className="text-base">Segurança</CartaoTitulo>
                <CartaoDescricao>
                  Atualize sua senha periodicamente.
                </CartaoDescricao>
              </CartaoCabecalho>
              <CartaoConteudo className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="senha-nova"
                    >
                      Nova senha
                    </label>
                    <input
                      id="senha-nova"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={senhaNova}
                      onChange={(event) => setSenhaNova(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="senha-confirmacao"
                    >
                      Confirmar senha
                    </label>
                    <input
                      id="senha-confirmacao"
                      type="password"
                      placeholder="Confirme a senha"
                      value={senhaConfirmacao}
                      onChange={(event) =>
                        setSenhaConfirmacao(event.target.value)
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    {senhaFoiDigitada ? (
                      <p
                        className={cn(
                          "text-xs",
                          senhasConferem
                            ? "text-emerald-600"
                            : "text-destructive"
                        )}
                      >
                        {senhasConferem
                          ? "Senhas conferem."
                          : senhaNova.length < 6
                            ? "A senha deve ter pelo menos 6 caracteres."
                            : "As senhas não conferem."}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Botao
                    variant="secondary"
                    onClick={handleAlterarSenha}
                    disabled={!senhasConferem || alterarSenha.isPending}
                  >
                    {alterarSenha.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Atualizar senha
                  </Botao>
                </div>
              </CartaoConteudo>
            </Cartao>

            {/* Preferências */}
            <Cartao>
              <CartaoCabecalho>
                <CartaoTitulo className="text-base">
                  Preferências
                </CartaoTitulo>
                <CartaoDescricao>
                  Ajuste como deseja receber avisos e recomendações.
                </CartaoDescricao>
              </CartaoCabecalho>
              <CartaoConteudo className="space-y-4">
                {itensPreferencias.map((item) => {
                  const ativo = preferencias[item.id];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{item.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.descricao}
                        </p>
                      </div>
                      <Alternador
                        tamanho="sm"
                        ativado={ativo}
                        aoAlternar={() => alternarPreferencia(item.id)}
                      />
                    </div>
                  );
                })}
              </CartaoConteudo>
            </Cartao>
          </div>

          <div className="order-1 space-y-4 lg:order-2">
            {/* Foto do perfil */}
            <Cartao>
              <CartaoConteudo className="space-y-4 p-5">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                    {fotoExibida ? (
                      <Image
                        src={fotoExibida}
                        alt={nomeUsuario}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      iniciaisUsuario
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {nomeUsuario}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {emailUsuario}
                    </p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSelecionarArquivo}
                />

                {previewUrl && arquivoSelecionado ? (
                  <div className="space-y-2">
                    <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-primary/20">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Botao
                      variant="default"
                      size="sm"
                      className="w-full gap-2"
                      onClick={handleSalvarFoto}
                      disabled={uploadAvatar.isPending}
                    >
                      {uploadAvatar.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Salvar foto
                    </Botao>
                  </div>
                ) : null}

                <div className="flex gap-2">
                  {temFoto && !arquivoSelecionado ? (
                    <Botao
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={handleRemoverFoto}
                      disabled={removerAvatar.isPending}
                    >
                      {removerAvatar.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Remover foto
                    </Botao>
                  ) : (
                    <Botao
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                      {temFoto ? "Trocar foto" : "Alterar foto"}
                    </Botao>
                  )}
                </div>
              </CartaoConteudo>
            </Cartao>

            {/* Status da conta */}
            <Cartao>
              <CartaoConteudo className="space-y-3 p-5">
                <CartaoTitulo className="text-base">
                  Status da conta
                </CartaoTitulo>
                <div className="flex items-center gap-2">
                  <Emblema variant="sucesso" className="gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Conta verificada
                  </Emblema>
                </div>
                <div className="rounded-xl border border-border bg-[#F5F5F5] dark:bg-[#1E1E1E] px-4 py-3 text-xs text-muted-foreground">
                  Mantenha seus dados atualizados para garantir acesso às aulas
                  e conquistas.
                </div>
              </CartaoConteudo>
            </Cartao>
          </div>
        </SecaoAnimada>
      </AnimacaoPagina>
    </main>
  );
}
