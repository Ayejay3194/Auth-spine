import { Card } from '../ui/card';

type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string | Date;
};

export function ProjectList({ projects }: { projects: Project[] }) {
  if (!projects.length) {
    return <p className="text-sm text-slate-400">No projects yet.</p>;
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <Card key={project.id}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">{project.name}</h2>
              {project.description && (
                <p className="text-xs text-slate-400 mt-1">
                  {project.description}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
