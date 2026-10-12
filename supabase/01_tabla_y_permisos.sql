-- OPCIONAL. Para una tabla beta_signups dedicada exclusivamente a esta landing.
-- Si ya tienes la tabla del PDF, no se eliminan registros y no se recrea el proyecto.
-- Revisa primero sus columnas y políticas. Si otra app usa esta tabla con anon o
-- authenticated, no ejecutes este archivo sin adaptar sus permisos.
-- El CREATE IF NOT EXISTS no modifica columnas de una tabla ya existente.
begin;
create table if not exists public.beta_signups (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(trim(nombre)) between 2 and 100),
  correo text not null check (char_length(correo) <= 254 and correo ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  perfil_empresa text not null check (char_length(trim(perfil_empresa)) between 1 and 180),
  necesidad text not null check (necesidad in ('inventario','mantenimiento','cronogramas','reportes','otra')),
  interes text not null check (interes in ('probar beta','recibir demostración','conocer precios')),
  consentimiento boolean not null default false check (consentimiento = true),
  fecha_inscripcion timestamptz not null default now()
);
alter table public.beta_signups enable row level security;
-- Se conservan privilegios administrativos de service_role; nunca usar su clave en frontend.
revoke all privileges on table public.beta_signups from public, anon, authenticated;
-- Retira también permisos por columna que pudieran existir en una tabla previa.
revoke all privileges (id,nombre,correo,perfil_empresa,necesidad,interes,consentimiento,fecha_inscripcion)
  on table public.beta_signups from public, anon, authenticated;
-- El público puede enviar estos seis campos, pero no leer, actualizar ni eliminar registros.
grant usage on schema public to anon;
grant insert (nombre,correo,perfil_empresa,necesidad,interes,consentimiento)
  on public.beta_signups to anon;

drop policy if exists "biogestion_anon_insert" on public.beta_signups;
create policy "biogestion_anon_insert" on public.beta_signups
  as permissive for insert to anon with check (
    consentimiento = true
    and char_length(trim(nombre)) between 2 and 100
    and char_length(correo) <= 254
    and correo ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and char_length(trim(perfil_empresa)) between 1 and 180
    and necesidad in ('inventario','mantenimiento','cronogramas','reportes','otra')
    and interes in ('probar beta','recibir demostración','conocer precios')
  );
-- Restrictiva: las políticas permisivas previas no deben permitir saltar estas validaciones.
drop policy if exists "biogestion_valid_payload" on public.beta_signups;
create policy "biogestion_valid_payload" on public.beta_signups
  as restrictive for insert to anon with check (
    consentimiento = true
    and char_length(trim(nombre)) between 2 and 100
    and char_length(correo) <= 254
    and correo ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and char_length(trim(perfil_empresa)) between 1 and 180
    and necesidad in ('inventario','mantenimiento','cronogramas','reportes','otra')
    and interes in ('probar beta','recibir demostración','conocer precios')
  );
commit;
