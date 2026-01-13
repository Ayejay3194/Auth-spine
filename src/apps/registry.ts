// Simple inline engines for demo
const demoEngines = {
  predictiveScheduling: {
    name: 'predictive_scheduling',
    version: '1.0.0',
    run: async (ctx: any) => []
  },
  clientBehavior: {
    name: 'client_behavior', 
    version: '1.0.0',
    run: async (ctx: any) => []
  }
};

export function defaultEngines() {
  return [demoEngines.predictiveScheduling, demoEngines.clientBehavior];
}
