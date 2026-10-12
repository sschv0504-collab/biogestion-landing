-- CONSULTAS DE SOLO LECTURA. Ejecutar en SQL Editor para revisar una tabla existente.
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'beta_signups'
order by ordinal_position;

select relrowsecurity as rls_activado
from pg_class where oid = to_regclass('public.beta_signups');

select policyname, permissive, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public' and tablename = 'beta_signups';

select grantee, privilege_type
from information_schema.table_privileges
where table_schema = 'public' and table_name = 'beta_signups'
order by grantee, privilege_type;

select grantee, column_name, privilege_type
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'beta_signups'
order by grantee, column_name;
