{{- define "business-spine.name" -}}
business-spine
{{- end -}}

{{- define "business-spine.fullname" -}}
{{ include "business-spine.name" . }}
{{- end -}}
