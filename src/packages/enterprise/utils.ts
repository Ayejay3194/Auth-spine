/**
 * Launch Gate Utils - Utility functions for launch gate
 */

export class LaunchGateUtils {
  static calculateScore(completedItems: number, totalItems: number): number {
    return Math.round((completedItems / totalItems) * 100);
  }

  static isReadyToLaunch(status: any): boolean {
    return status.blockedItems.length === 0 && status.score >= 95;
  }
}
