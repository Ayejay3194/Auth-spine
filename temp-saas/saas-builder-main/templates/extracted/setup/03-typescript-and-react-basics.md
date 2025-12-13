# TypeScript + React Basics (Without the Fluff)

You do **not** need to know every TS/React trick to build real apps.

Know this first:

## TypeScript

- Use `.ts` for logic files, `.tsx` for React components.
- Define types for:
  - entities (`Project`, `User`, etc.)
  - props (`ProjectCardProps`)
  - API responses.

Minimal pattern:

```ts
export interface Project {
  id: string;
  name: string;
  description?: string;
}

export function formatProjectName(project: Project): string {
  return project.name.trim();
}
```

## React

- Components are functions that return JSX.
- Props are typed with interfaces.

Example:

```tsx
interface ProjectCardProps {
  name: string;
  description?: string;
}

export function ProjectCard({ name, description }: ProjectCardProps) {
  return (
    <div>
      <h2>{name}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
```

You can learn everything else while building features.
