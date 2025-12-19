# AdminSuite (React + Tailwind)

Single-page admin audit suite UI with:
- Infrastructure tests (pass/fail/pending + notes)
- Code quality checks (pass/fail/pending + notes)
- Stats dashboard + completion %
- Exportable text report

## Requirements
- React
- TailwindCSS
- lucide-react

## Install
```bash
npm i lucide-react
```

## Use
Put `src/AdminSuite.tsx` anywhere in your app, then render:

```tsx
import AdminSuite from "./AdminSuite";

export default function Page() {
  return <AdminSuite />;
}
```
