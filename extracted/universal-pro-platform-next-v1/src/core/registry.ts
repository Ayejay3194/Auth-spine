import type { Module, ModuleContext } from "./types";

export class ModuleRegistry {
  private modules: Module[] = [];
  private started = false;
  constructor(private ctx: ModuleContext) {}
  register(...mods: Module[]) { if (this.started) throw new Error("Registry already started."); this.modules.push(...mods); }
  async start() {
    if (this.started) return;
    this.started = true;
    this.modules.sort((a,b)=> (a.meta.requires?.length ?? 0) - (b.meta.requires?.length ?? 0));
    for (const mod of this.modules) { this.ctx.logger.info(`Starting ${mod.meta.id}@${mod.meta.version}`); await mod.init(this.ctx); }
  }
  list(){ return this.modules.map((m)=>m.meta); }
}
