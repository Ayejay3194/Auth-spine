# Cache keys must include tenant
Bad:   cache.get("projects:list")
Good:  cache.get(`${tenantId}:projects:list`)
Also include role/scopes for permissioned responses.
