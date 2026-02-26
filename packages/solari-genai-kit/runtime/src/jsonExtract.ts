export function extractFirstJson(t:string){const s=t.indexOf('{');const e=t.lastIndexOf('}');if(s<0||e<0||e<=s)return null;try{return JSON.parse(t.slice(s,e+1));}catch{return null;}}
