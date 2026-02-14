'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  useAdminCursos,
  useAdminCriarCurso,
  useAdminDeletarCurso,
} from '@/hooks/admin/useAdminCursos'
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Layers,
  Eye,
  EyeOff,
  Archive,
  GraduationCap,
} from 'lucide-react'
import type { CursoCreateInput } from '@/lib/schemas/admin'

const STATUS_LABELS: Record<string, { label: string; cor: string }> = {
  publicado: { label: 'Publicado', cor: 'bg-green-500/10 text-green-400' },
  rascunho: { label: 'Rascunho', cor: 'bg-yellow-500/10 text-yellow-400' },
  arquivado: { label: 'Arquivado', cor: 'bg-zinc-500/10 text-zinc-400' },
}

const NIVEL_LABELS: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediario',
  avancado: 'Avancado',
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  publicado: <Eye className="w-3 h-3" />,
  rascunho: <EyeOff className="w-3 h-3" />,
  arquivado: <Archive className="w-3 h-3" />,
}

function FormNovoCurso({ onClose }: { onClose: () => void }) {
  const criarCurso = useAdminCriarCurso()
  const [form, setForm] = useState<CursoCreateInput>({
    titulo: '',
    descricao: '',
    categoria: '',
    nivel: 'iniciante',
    status: 'publicado',
    destaque: false,
    ordem: 0,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    criarCurso.mutate(form, {
      onSuccess: () => onClose(),
    })
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Novo Curso</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Titulo</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Categoria</label>
            <input
              type="text"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              required
              placeholder="Ex: Produtividade, Lideranca..."
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Nivel</label>
            <select
              value={form.nivel}
              onChange={(e) => setForm({ ...form, nivel: e.target.value as 'iniciante' | 'intermediario' | 'avancado' })}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediario</option>
              <option value="avancado">Avancado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as 'rascunho' | 'publicado' | 'arquivado' })}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="publicado">Publicado</option>
              <option value="rascunho">Rascunho</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Descricao</label>
          <textarea
            value={form.descricao ?? ''}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">URL da Imagem (opcional)</label>
          <input
            type="url"
            value={form.imagem_url ?? ''}
            onChange={(e) => setForm({ ...form, imagem_url: e.target.value || null })}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="destaque"
            checked={form.destaque}
            onChange={(e) => setForm({ ...form, destaque: e.target.checked })}
            className="rounded bg-zinc-800 border-zinc-700"
          />
          <label htmlFor="destaque" className="text-sm text-zinc-400">Curso em destaque</label>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={criarCurso.isPending}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {criarCurso.isPending ? 'Criando...' : 'Criar Curso'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function AdminCursosPage() {
  const { data: cursos, isLoading } = useAdminCursos()
  const deletarCurso = useAdminDeletarCurso()
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleDelete(id: string, titulo: string) {
    if (!confirm(`Tem certeza que deseja deletar "${titulo}"? Esta acao nao pode ser desfeita.`)) {
      return
    }
    setDeletingId(id)
    deletarCurso.mutate(id, {
      onSettled: () => setDeletingId(null),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cursos</h1>
          <p className="text-zinc-400 text-sm mt-1">Gerenciar cursos, modulos e aulas</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Curso
        </button>
      </div>

      {showForm && <FormNovoCurso onClose={() => setShowForm(false)} />}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-zinc-800 rounded w-48 mb-2" />
              <div className="h-3 bg-zinc-800 rounded w-32" />
            </div>
          ))}
        </div>
      ) : !cursos?.length ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <GraduationCap className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">Nenhum curso cadastrado</p>
          <p className="text-zinc-500 text-sm mt-1">Crie seu primeiro curso clicando no botao acima</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cursos.map((curso) => {
            const status = STATUS_LABELS[curso.status] ?? STATUS_LABELS.rascunho
            return (
              <div
                key={curso.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between hover:border-zinc-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-medium truncate">{curso.titulo}</h3>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${status.cor}`}>
                      {STATUS_ICONS[curso.status]}
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-zinc-500">
                    <span>{curso.categoria}</span>
                    <span>{NIVEL_LABELS[curso.nivel] ?? curso.nivel}</span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {curso.total_modulos ?? 0} modulos
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {curso.total_aulas ?? 0} aulas
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/admin/cursos/${curso.id}`}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(curso.id, curso.titulo)}
                    disabled={deletingId === curso.id}
                    className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
