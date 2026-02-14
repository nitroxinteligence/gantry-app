'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  useAdminCursoById,
  useAdminAtualizarCurso,
  useAdminCriarModulo,
  useAdminDeletarModulo,
  useAdminAtualizarModulo,
  useAdminCriarAula,
  useAdminAtualizarAula,
  useAdminDeletarAula,
} from '@/hooks/admin/useAdminCursos'
import { parseVideoUrl } from '@/lib/admin/video-embed'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronRight,
  Play,
  Pencil,
  X,
  Video,
} from 'lucide-react'
import type { ModuloAdmin, AulaAdmin } from '@/types/admin'

// ==========================================
// FORMULARIO AULA
// ==========================================

function FormAula({
  moduleId,
  aula,
  onClose,
}: {
  moduleId: string
  aula?: AulaAdmin
  onClose: () => void
}) {
  const criarAula = useAdminCriarAula()
  const atualizarAula = useAdminAtualizarAula()
  const isEditing = !!aula

  const [form, setForm] = useState({
    titulo: aula?.titulo ?? '',
    descricao: aula?.descricao ?? '',
    duracao_segundos: aula?.duracao_segundos ?? 0,
    xp_recompensa: aula?.xp_recompensa ?? 10,
    video_url: aula?.video_url ?? '',
    ordem: aula?.ordem ?? 0,
  })

  const videoEmbed = form.video_url ? parseVideoUrl(form.video_url) : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = {
      ...form,
      video_url: form.video_url || null,
      descricao: form.descricao || null,
    }

    if (isEditing && aula) {
      atualizarAula.mutate({ id: aula.id, data }, { onSuccess: () => onClose() })
    } else {
      criarAula.mutate({ ...data, module_id: moduleId }, { onSuccess: () => onClose() })
    }
  }

  const isPending = criarAula.isPending || atualizarAula.isPending

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mt-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Titulo da Aula</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              URL do Video (YouTube/Vimeo/Panda Video)
            </label>
            <input
              type="url"
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Duracao (segundos)</label>
            <input
              type="number"
              value={form.duracao_segundos}
              onChange={(e) => setForm({ ...form, duracao_segundos: Number(e.target.value) })}
              min={0}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">XP Recompensa</label>
            <input
              type="number"
              value={form.xp_recompensa}
              onChange={(e) => setForm({ ...form, xp_recompensa: Number(e.target.value) })}
              min={0}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Descricao</label>
          <textarea
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
        </div>

        {videoEmbed && videoEmbed.provider !== 'unknown' && (
          <div className="rounded-lg overflow-hidden bg-black aspect-video max-w-md">
            <iframe
              src={videoEmbed.embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Preview do video"
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Salvando...' : isEditing ? 'Atualizar Aula' : 'Adicionar Aula'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ==========================================
// CARD MODULO
// ==========================================

function CardModulo({ modulo, courseId }: { modulo: ModuloAdmin; courseId: string }) {
  const [expanded, setExpanded] = useState(false)
  const [showAulaForm, setShowAulaForm] = useState(false)
  const [editingAula, setEditingAula] = useState<AulaAdmin | null>(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState(modulo.titulo)

  const deletarModulo = useAdminDeletarModulo()
  const atualizarModulo = useAdminAtualizarModulo()
  const deletarAula = useAdminDeletarAula()

  const aulas = modulo.aulas ?? []

  function handleDeleteModulo() {
    if (!confirm(`Deletar modulo "${modulo.titulo}" e todas as suas aulas?`)) return
    deletarModulo.mutate(modulo.id)
  }

  function handleSaveTitle() {
    if (newTitle.trim() && newTitle !== modulo.titulo) {
      atualizarModulo.mutate({ id: modulo.id, data: { titulo: newTitle.trim() } })
    }
    setEditingTitle(false)
  }

  function handleDeleteAula(aulaId: string, aulaTitle: string) {
    if (!confirm(`Deletar aula "${aulaTitle}"?`)) return
    deletarAula.mutate(aulaId)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          )}
          {editingTitle ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                autoFocus
                className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          ) : (
            <h3 className="text-white font-medium text-sm">{modulo.titulo}</h3>
          )}
          <span className="text-xs text-zinc-500">{aulas.length} aulas</span>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setEditingTitle(true)}
            className="p-1.5 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setShowAulaForm(true); setExpanded(true) }}
            className="p-1.5 rounded text-zinc-500 hover:text-violet-400 hover:bg-zinc-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDeleteModulo}
            className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-zinc-800 px-4 pb-4">
          {aulas.length === 0 && !showAulaForm && (
            <p className="text-zinc-500 text-xs py-3 text-center">
              Nenhuma aula neste modulo
            </p>
          )}

          {aulas.map((aula: AulaAdmin) => (
            <div
              key={aula.id}
              className="flex items-center justify-between py-2.5 border-b border-zinc-800/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded bg-zinc-800 flex items-center justify-center">
                  {aula.video_url ? (
                    <Play className="w-3 h-3 text-violet-400" />
                  ) : (
                    <Video className="w-3 h-3 text-zinc-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-white">{aula.titulo}</p>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span>{Math.floor(aula.duracao_segundos / 60)}min</span>
                    <span>+{aula.xp_recompensa} XP</span>
                    {aula.video_url && (
                      <span className="text-violet-400">
                        {parseVideoUrl(aula.video_url).provider}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingAula(aula)
                    setShowAulaForm(false)
                  }}
                  className="p-1.5 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteAula(aula.id, aula.titulo)}
                  className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {showAulaForm && (
            <FormAula
              moduleId={modulo.id}
              onClose={() => setShowAulaForm(false)}
            />
          )}

          {editingAula && (
            <FormAula
              moduleId={modulo.id}
              aula={editingAula}
              onClose={() => setEditingAula(null)}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ==========================================
// PAGE
// ==========================================

export default function AdminCursoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: cursoData, isLoading } = useAdminCursoById(id)
  const atualizarCurso = useAdminAtualizarCurso()
  const criarModulo = useAdminCriarModulo()

  const [showModuloForm, setShowModuloForm] = useState(false)
  const [novoModuloTitulo, setNovoModuloTitulo] = useState('')

  function handleAddModulo(e: React.FormEvent) {
    e.preventDefault()
    if (!novoModuloTitulo.trim()) return

    criarModulo.mutate(
      { course_id: id, titulo: novoModuloTitulo.trim(), ordem: cursoData?.modulos?.length ?? 0 },
      {
        onSuccess: () => {
          setNovoModuloTitulo('')
          setShowModuloForm(false)
        },
      }
    )
  }

  function handleToggleStatus() {
    if (!cursoData) return
    const newStatus = cursoData.status === 'publicado' ? 'rascunho' : 'publicado'
    atualizarCurso.mutate({ id, data: { status: newStatus } })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-zinc-800 rounded w-48 animate-pulse" />
        <div className="h-64 bg-zinc-900 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!cursoData) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
        Curso nao encontrado
      </div>
    )
  }

  const modulos = cursoData.modulos ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/cursos')}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{cursoData.titulo}</h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            {cursoData.categoria} / {cursoData.nivel}
          </p>
        </div>
        <button
          onClick={handleToggleStatus}
          disabled={atualizarCurso.isPending}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            cursoData.status === 'publicado'
              ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
              : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
          }`}
        >
          {cursoData.status === 'publicado' ? 'Publicado' : 'Rascunho'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Modulos ({modulos.length})
        </h2>
        <button
          onClick={() => setShowModuloForm(!showModuloForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Modulo
        </button>
      </div>

      {showModuloForm && (
        <form
          onSubmit={handleAddModulo}
          className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4"
        >
          <input
            type="text"
            value={novoModuloTitulo}
            onChange={(e) => setNovoModuloTitulo(e.target.value)}
            placeholder="Titulo do modulo..."
            autoFocus
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            disabled={criarModulo.isPending}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowModuloForm(false)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      <div className="space-y-3">
        {modulos.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <p className="text-zinc-400">Nenhum modulo criado</p>
            <p className="text-zinc-500 text-sm mt-1">
              Adicione modulos para organizar as aulas do curso
            </p>
          </div>
        ) : (
          modulos.map((modulo: ModuloAdmin) => (
            <CardModulo key={modulo.id} modulo={modulo} courseId={id} />
          ))
        )}
      </div>
    </div>
  )
}
