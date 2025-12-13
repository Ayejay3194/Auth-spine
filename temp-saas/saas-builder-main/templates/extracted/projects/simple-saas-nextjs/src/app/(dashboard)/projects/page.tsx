import { getProjects } from '../../../lib/db';
import { ProjectList } from '../../../components/projects/project-list';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  // For now, we pretend the "current user" is the seeded demo user.
  const projects = await getProjects();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <ProjectList projects={projects} />
    </div>
  );
}
