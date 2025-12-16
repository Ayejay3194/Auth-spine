/**
 * Kill Switches Utils - Utility functions for kill switches
 */

export class KillSwitchUtils {
  static isCritical(category: string): boolean {
    return category === 'critical';
  }

  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  static canAutoDisable(switchId: string): boolean {
    // Implementation would check if switch can auto-disable
    return true;
  }
}
