// =====================================================
// BACKGROUND FORFEIT SERVICE
// =====================================================
// This service automatically checks for player forfeits in the background
// and updates them without requiring user interaction

import { PlayersService } from './players';

class BackgroundForfeitService {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isRunning = false;

  // Start the background forfeit checking
  static start() {
    if (this.isRunning) {
      console.log('Background forfeit service already running');
      return;
    }

    console.log('Starting background forfeit service...');
    this.isRunning = true;

    // Check immediately when starting
    this.checkForfeits();

    // Then check every 5 minutes
    this.intervalId = setInterval(() => {
      this.checkForfeits();
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Stop the background forfeit checking
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Background forfeit service stopped');
  }

  // Check for forfeits (called automatically)
  private static async checkForfeits() {
    try {
      console.log('🔍 Background forfeit check running...');
      const result = await PlayersService.checkAndUpdateForfeitStatus();
      
      if (result.updated > 0) {
        console.log(`✅ Background forfeit: ${result.updated} player(s) set to Forfeit`);
        // You could add a notification system here if needed
      } else {
        console.log('✅ Background forfeit check: No players needed forfeit status update');
      }
    } catch (error) {
      console.error('❌ Background forfeit check failed:', error);
    }
  }

  // Get service status
  static getStatus() {
    return {
      isRunning: this.isRunning,
      hasInterval: this.intervalId !== null
    };
  }
}

export default BackgroundForfeitService;
