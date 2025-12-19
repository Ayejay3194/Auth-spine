-- Fuzzy search helpers for listings/practitioners

-- Example table assumptions:
-- practitioners(id uuid pk, display_name text, bio text, specialties text[])

-- Trigram index
-- create index if not exists practitioners_name_trgm_idx on practitioners using gin (display_name gin_trgm_ops);

create or replace function app_search_practitioners(p_query text, p_limit int default 20)
returns table(
  id uuid,
  display_name text,
  score real
)
language sql
stable
as $$
select
  p.id,
  p.display_name,
  greatest(
    similarity(p.display_name, p_query),
    similarity(coalesce(p.bio,''), p_query)
  ) as score
from practitioners p
where
  p.display_name % p_query
  or coalesce(p.bio,'') % p_query
order by score desc
limit p_limit;
$$;
