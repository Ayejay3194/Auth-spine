export type ToolName = "calcEphemeris" | "scoreCompatibility" | "rankNearbyStylists" | "getCurrentTime" | "calculateDistance" | "searchDocuments";

export interface ToolResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Calculate ephemeris position for a celestial body
 * Uses simplified VSOP87-like algorithms for Sun, Moon, and planets
 */
export async function calcEphemeris(body: string, jd: number): Promise<ToolResult> {
  try {
    const T = (jd - 2451545.0) / 36525.0;
    let lon = 0, lat = 0, r = 0;
    
    switch (body.toLowerCase()) {
      case 'sun': {
        const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
        const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
        const e = 0.016708634 - 0.000042037 * T;
        const C = (1.914602 - 0.004817 * T) * Math.sin(M * Math.PI / 180)
                + (0.019993 - 0.000101 * T) * Math.sin(2 * M * Math.PI / 180);
        lon = (L0 + C) * Math.PI / 180;
        r = 1.000001018 * (1 - e * e) / (1 + e * Math.cos((M + C) * Math.PI / 180));
        break;
      }
      case 'moon': {
        const L = 218.316 + 13.176396 * T;
        const M = 134.963 + 13.064993 * T;
        const D = 297.850 + 12.190749 * T;
        lon = (L + 6.289 * Math.sin(M * Math.PI / 180)) * Math.PI / 180;
        lat = 5.128 * Math.sin(D * Math.PI / 180) * Math.PI / 180;
        r = 60.0 / (1 + 0.0549 * Math.cos(M * Math.PI / 180));
        break;
      }
      case 'mercury': { lon = (252.251 + 4.092338 * T) * Math.PI / 180; r = 0.3871; break; }
      case 'venus': { lon = (181.979 + 1.602130 * T) * Math.PI / 180; r = 0.7233; break; }
      case 'mars': { lon = (355.433 + 0.524021 * T) * Math.PI / 180; r = 1.5237; break; }
      case 'jupiter': { lon = (34.351 + 0.083091 * T) * Math.PI / 180; r = 5.2026; break; }
      case 'saturn': { lon = (50.077 + 0.033444 * T) * Math.PI / 180; r = 9.5549; break; }
      default: return { ok: false, error: `Unknown body: ${body}` };
    }
    
    lon = lon % (2 * Math.PI);
    if (lon < 0) lon += 2 * Math.PI;
    
    return {
      ok: true,
      data: { body, julianDate: jd, longitude: lon, latitude: lat, distance: r, longitudeDeg: lon * 180 / Math.PI, latitudeDeg: lat * 180 / Math.PI }
    };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

/**
 * Score compatibility between two entities
 */
export async function scoreCompatibility(entity1: string, entity2: string, date?: string): Promise<ToolResult> {
  try {
    const jd = date ? new Date(date).getTime() / 86400000 + 2440587.5 : 2451545.0;
    const pos1 = await calcEphemeris(entity1 || 'sun', jd);
    const pos2 = await calcEphemeris(entity2 || 'moon', jd);
    
    if (!pos1.ok || !pos2.ok) return { ok: false, error: 'Failed to calculate positions' };
    
    const p1 = pos1.data as { longitude: number };
    const p2 = pos2.data as { longitude: number };
    
    let separation = Math.abs(p1.longitude - p2.longitude);
    if (separation > Math.PI) separation = 2 * Math.PI - separation;
    
    const aspects = [0, 60, 90, 120, 180].map(a => a * Math.PI / 180);
    const closestAspect = aspects.reduce((closest, aspect) => {
      const diff = Math.abs(separation - aspect);
      return diff < closest.diff ? { aspect, diff } : closest;
    }, { aspect: 0, diff: Math.PI });
    
    const orb = closestAspect.diff * 180 / Math.PI;
    const score = Math.max(0, 1 - orb / 10);
    
    const aspectNames: Record<number, string> = { 0: 'Conjunction', 60: 'Sextile', 90: 'Square', 120: 'Trine', 180: 'Opposition' };
    
    return {
      ok: true,
      data: { entity1, entity2, score: Math.round(score * 100) / 100, separation: Math.round(separation * 180 / Math.PI * 100) / 100, aspect: aspectNames[closestAspect.aspect * 180 / Math.PI], orb: Math.round(orb * 100) / 100 }
    };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

/**
 * Rank nearby stylists
 */
export async function rankNearbyStylists(latitude: number, longitude: number, radius: number = 10): Promise<ToolResult> {
  try {
    const stylists = [
      { id: '1', name: 'Sarah Johnson', lat: 40.7128, lon: -74.006, rating: 4.8, reviews: 127, specialty: 'Color' },
      { id: '2', name: 'Mike Chen', lat: 40.7580, lon: -73.9855, rating: 4.9, reviews: 203, specialty: 'Cut' },
      { id: '3', name: 'Elena Rodriguez', lat: 40.7282, lon: -73.7949, rating: 4.7, reviews: 89, specialty: 'Style' },
      { id: '4', name: 'David Kim', lat: 40.6782, lon: -73.9442, rating: 4.6, reviews: 156, specialty: 'Barber' },
      { id: '5', name: 'Lisa Thompson', lat: 40.7614, lon: -73.9776, rating: 4.9, reviews: 312, specialty: 'Color' }
    ];
    
    const ranked = stylists.map(s => {
      const R = 6371;
      const dLat = (s.lat - latitude) * Math.PI / 180;
      const dLon = (s.lon - longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(latitude * Math.PI / 180) * Math.cos(s.lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const score = (s.rating * Math.sqrt(s.reviews)) / (distance * 0.1 + 1);
      return { ...s, distance: Math.round(distance * 10) / 10, score: Math.round(score * 100) / 100 };
    })
    .filter(s => s.distance <= radius)
    .sort((a, b) => b.score - a.score);
    
    return { ok: true, data: { location: { latitude, longitude, radius }, count: ranked.length, stylists: ranked } };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

export async function runTool(tool: ToolName, args: any) {
  switch (tool) {
    case 'calcEphemeris': return calcEphemeris(String(args.body || 'sun'), Number(args.jd || Date.now() / 86400000 + 2440587.5));
    case 'scoreCompatibility': return scoreCompatibility(String(args.entity1 || 'sun'), String(args.entity2 || 'moon'), args.date);
    case 'rankNearbyStylists': return rankNearbyStylists(Number(args.latitude || 40.7128), Number(args.longitude || -74.0060), Number(args.radius || 10));
    default: return { ok: false, error: `Unknown tool: ${tool}` };
  }
}
