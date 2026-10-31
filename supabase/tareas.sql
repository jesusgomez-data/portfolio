-- ============================================================
-- Tabla de tareas del proyecto (lista que el cliente envía y
-- el profesional va marcando con check-in).
-- Ejecutar en Supabase → SQL Editor.
-- ============================================================

-- proyectos.id es uuid (confirmado en el error de ejecución anterior).

create table if not exists public.tareas (
    id          uuid primary key default gen_random_uuid(),
    proyecto_id uuid not null references public.proyectos(id) on delete cascade,
    titulo      text not null check (char_length(titulo) between 1 and 200),
    estado      text not null default 'pendiente'
                check (estado in ('pendiente', 'en_proceso', 'hecha')),
    creado_por  text not null default 'client'
                check (creado_por in ('client', 'admin')),
    checkin_at  timestamptz,
    created_at  timestamptz not null default now()
);

create index if not exists tareas_proyecto_idx on public.tareas (proyecto_id, created_at);

-- 2) Tiempo real: que el portal y el admin se actualicen al instante
--    (si ya estaba agregada, este paso dará un aviso y puedes ignorarlo)
alter publication supabase_realtime add table public.tareas;

-- 3) Seguridad: activa RLS y replica las mismas reglas que ya usas en "mensajes".
--    Revísalo antes: si "mensajes" no tiene RLS, esta tabla tampoco debería
--    bloquear nada. Estas políticas permiten leer/escribir con la clave pública,
--    igual que el resto del portal.
alter table public.tareas enable row level security;

drop policy if exists "tareas_select_publico" on public.tareas;
drop policy if exists "tareas_insert_publico" on public.tareas;
drop policy if exists "tareas_update_publico" on public.tareas;

create policy "tareas_select_publico" on public.tareas for select using (true);
create policy "tareas_insert_publico" on public.tareas for insert with check (true);
create policy "tareas_update_publico" on public.tareas for update using (true) with check (true);
