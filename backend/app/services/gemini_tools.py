from google.genai import types

function_declarations = [
    types.FunctionDeclaration(
        name="criar_tarefa",
        description="Cria uma nova tarefa no quadro Kanban do usuario",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "titulo": types.Schema(type="STRING", description="Titulo da tarefa"),
                "descricao": types.Schema(type="STRING", description="Descricao detalhada (opcional)"),
                "prioridade": types.Schema(
                    type="STRING",
                    description="Prioridade: baixa, media, alta ou urgente",
                    enum=["baixa", "media", "alta", "urgente"],
                ),
                "data_limite": types.Schema(type="STRING", description="Data limite YYYY-MM-DD (opcional)"),
            },
            required=["titulo"],
        ),
    ),
    types.FunctionDeclaration(
        name="editar_tarefa",
        description="Edita uma tarefa existente no quadro Kanban. Requer o ID da tarefa.",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "tarefa_id": types.Schema(type="STRING", description="UUID da tarefa a editar"),
                "titulo": types.Schema(type="STRING", description="Novo titulo"),
                "descricao": types.Schema(type="STRING", description="Nova descricao"),
                "prioridade": types.Schema(
                    type="STRING",
                    description="Nova prioridade",
                    enum=["baixa", "media", "alta", "urgente"],
                ),
                "coluna": types.Schema(
                    type="STRING",
                    description="Mover para coluna",
                    enum=["backlog", "a_fazer", "em_andamento"],
                ),
                "data_limite": types.Schema(type="STRING", description="Nova data limite YYYY-MM-DD"),
            },
            required=["tarefa_id"],
        ),
    ),
    types.FunctionDeclaration(
        name="excluir_tarefa",
        description="Exclui permanentemente uma tarefa do quadro Kanban",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "tarefa_id": types.Schema(type="STRING", description="UUID da tarefa a excluir"),
            },
            required=["tarefa_id"],
        ),
    ),
    types.FunctionDeclaration(
        name="concluir_tarefa",
        description="Marca uma tarefa como concluida e ganha XP",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "tarefa_id": types.Schema(type="STRING", description="UUID da tarefa a concluir"),
            },
            required=["tarefa_id"],
        ),
    ),
    types.FunctionDeclaration(
        name="criar_habito",
        description="Cria um novo habito para o usuario acompanhar diariamente",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "titulo": types.Schema(type="STRING", description="Titulo do habito"),
                "descricao": types.Schema(type="STRING", description="Descricao do habito (opcional)"),
                "frequencia": types.Schema(
                    type="STRING",
                    description="Frequencia: diario ou semanal",
                    enum=["diario", "semanal"],
                ),
            },
            required=["titulo"],
        ),
    ),
    types.FunctionDeclaration(
        name="editar_habito",
        description="Edita um habito existente",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "habito_id": types.Schema(type="STRING", description="UUID do habito"),
                "titulo": types.Schema(type="STRING", description="Novo titulo"),
                "descricao": types.Schema(type="STRING", description="Nova descricao"),
                "frequencia": types.Schema(
                    type="STRING",
                    description="Nova frequencia",
                    enum=["diario", "semanal"],
                ),
            },
            required=["habito_id"],
        ),
    ),
    types.FunctionDeclaration(
        name="excluir_habito",
        description="Exclui permanentemente um habito",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "habito_id": types.Schema(type="STRING", description="UUID do habito"),
            },
            required=["habito_id"],
        ),
    ),
    types.FunctionDeclaration(
        name="marcar_habito",
        description="Marca um habito como feito hoje, ganhando XP e atualizando o streak",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "habito_id": types.Schema(type="STRING", description="UUID do habito"),
            },
            required=["habito_id"],
        ),
    ),
    types.FunctionDeclaration(
        name="criar_meta",
        description="Cria uma nova meta para o usuario acompanhar",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "titulo": types.Schema(type="STRING", description="Titulo da meta"),
                "descricao": types.Schema(type="STRING", description="Descricao da meta (opcional)"),
                "progresso_total": types.Schema(type="NUMBER", description="Valor total a atingir"),
                "unidade": types.Schema(type="STRING", description="Unidade de medida (ex: push-ups, livros, km)"),
            },
            required=["titulo"],
        ),
    ),
    types.FunctionDeclaration(
        name="editar_meta",
        description="Edita uma meta existente (titulo, progresso ou status)",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "meta_id": types.Schema(type="STRING", description="UUID da meta"),
                "titulo": types.Schema(type="STRING", description="Novo titulo"),
                "progresso_atual": types.Schema(type="NUMBER", description="Novo valor do progresso atual"),
                "status": types.Schema(
                    type="STRING",
                    description="Novo status",
                    enum=["a_fazer", "em_andamento", "concluido"],
                ),
            },
            required=["meta_id"],
        ),
    ),
    types.FunctionDeclaration(
        name="excluir_meta",
        description="Exclui permanentemente uma meta",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "meta_id": types.Schema(type="STRING", description="UUID da meta"),
            },
            required=["meta_id"],
        ),
    ),
    types.FunctionDeclaration(
        name="criar_pendencia",
        description="Cria uma pendencia rapida (item que ainda nao e tarefa)",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "titulo": types.Schema(type="STRING", description="Titulo da pendencia"),
                "descricao": types.Schema(type="STRING", description="Descricao (opcional)"),
                "prioridade": types.Schema(
                    type="STRING",
                    description="Prioridade",
                    enum=["baixa", "media", "alta", "urgente"],
                ),
            },
            required=["titulo"],
        ),
    ),
    types.FunctionDeclaration(
        name="agendar_foco",
        description="Sugere iniciar uma sessao de foco com duracao e modo especificos",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "duracao_minutos": types.Schema(type="NUMBER", description="Duracao em minutos"),
                "modo": types.Schema(
                    type="STRING",
                    description="Modo de foco",
                    enum=["pomodoro", "deep_work", "flowtime"],
                ),
            },
            required=["duracao_minutos"],
        ),
    ),
    types.FunctionDeclaration(
        name="analisar_performance",
        description="Gera uma analise detalhada da performance do usuario baseada em todos os dados",
        parameters=types.Schema(
            type="OBJECT",
            properties={},
        ),
    ),
    types.FunctionDeclaration(
        name="criar_evento",
        description="Cria um novo evento na agenda do usuario",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "titulo": types.Schema(type="STRING", description="Titulo do evento"),
                "descricao": types.Schema(type="STRING", description="Descricao do evento (opcional)"),
                "data": types.Schema(type="STRING", description="Data do evento YYYY-MM-DD"),
                "horario_inicio": types.Schema(type="STRING", description="Horario de inicio HH:MM"),
                "horario_fim": types.Schema(type="STRING", description="Horario de fim HH:MM"),
                "categoria": types.Schema(type="STRING", description="Categoria do evento (ex: trabalho, pessoal, estudo)"),
            },
            required=["titulo", "data", "horario_inicio", "horario_fim"],
        ),
    ),
    types.FunctionDeclaration(
        name="editar_evento",
        description="Edita um evento existente na agenda",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "evento_id": types.Schema(type="STRING", description="UUID do evento"),
                "titulo": types.Schema(type="STRING", description="Novo titulo"),
                "descricao": types.Schema(type="STRING", description="Nova descricao"),
                "data": types.Schema(type="STRING", description="Nova data YYYY-MM-DD"),
                "horario_inicio": types.Schema(type="STRING", description="Novo horario inicio HH:MM"),
                "horario_fim": types.Schema(type="STRING", description="Novo horario fim HH:MM"),
                "categoria": types.Schema(type="STRING", description="Nova categoria"),
            },
            required=["evento_id"],
        ),
    ),
    types.FunctionDeclaration(
        name="excluir_evento",
        description="Exclui permanentemente um evento da agenda",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "evento_id": types.Schema(type="STRING", description="UUID do evento a excluir"),
            },
            required=["evento_id"],
        ),
    ),
    types.FunctionDeclaration(
        name="recomendar_curso",
        description="Recomenda cursos relevantes baseado nos objetivos e performance do usuario",
        parameters=types.Schema(
            type="OBJECT",
            properties={},
        ),
    ),
]

tool = types.Tool(function_declarations=function_declarations)
