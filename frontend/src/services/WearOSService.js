// I Ching del Benessere - WearOS & Apple Watch Support
// Provides smartwatch integration for quick consultations and daily hexagram

const API_URL = (process.env.REACT_APP_BACKEND_URL || "https://iching-backend-ac3n.onrender.com");

class WearOSService {
  constructor() {
    this.isWearOS = this.detectWearOS();
    this.isAppleWatch = this.detectAppleWatch();
    this.messageChannel = null;
  }

  // Detect if running on WearOS
  detectWearOS() {
    if (typeof window !== 'undefined' && window.Capacitor) {
      // Check for WearOS specific features
      return navigator.userAgent.includes('Android') && 
             (navigator.userAgent.includes('Wear') || 
              window.innerWidth <= 400 && window.innerHeight <= 400);
    }
    return false;
  }

  // Detect Apple Watch connection
  detectAppleWatch() {
    if (typeof window !== 'undefined' && window.Capacitor) {
      return window.Capacitor.getPlatform() === 'ios';
    }
    return false;
  }

  // Initialize watch connectivity
  async initialize() {
    try {
      if (this.isAppleWatch) {
        await this.initializeAppleWatch();
      } else if (this.isWearOS) {
        await this.initializeWearOS();
      }
      console.log('[WearOSService] Initialized');
    } catch (error) {
      console.error('[WearOSService] Initialization failed:', error);
    }
  }

  // Initialize Apple Watch connection
  async initializeAppleWatch() {
    try {
      // Use Capacitor Watch Connectivity plugin if available
      const { WatchConnectivity } = await import('@nickmessing/capacitor-watch-connectivity').catch(() => null);
      
      if (WatchConnectivity) {
        // Check if watch is paired and reachable
        const status = await WatchConnectivity.checkPaired();
        console.log('[WearOSService] Apple Watch paired:', status.isPaired);
        
        if (status.isPaired) {
          // Listen for messages from watch
          WatchConnectivity.addListener('messageReceived', (message) => {
            this.handleWatchMessage(message);
          });
        }
      }
    } catch (error) {
      console.warn('[WearOSService] Apple Watch init skipped:', error.message);
    }
  }

  // Initialize WearOS connection
  async initializeWearOS() {
    try {
      // Use Capacitor Wearable plugin if available
      const { Wearable } = await import('@nickmessing/capacitor-wearable').catch(() => null);
      
      if (Wearable) {
        // Set up message listener
        Wearable.addListener('messageReceived', (message) => {
          this.handleWatchMessage(message);
        });
        
        // Set up data listener
        Wearable.addListener('dataChanged', (data) => {
          this.handleDataSync(data);
        });
      }
    } catch (error) {
      console.warn('[WearOSService] WearOS init skipped:', error.message);
    }
  }

  // Handle messages from smartwatch
  handleWatchMessage(message) {
    console.log('[WearOSService] Message from watch:', message);
    
    const { action, data } = message;
    
    switch (action) {
      case 'GET_DAILY_HEXAGRAM':
        this.sendDailyHexagramToWatch();
        break;
      case 'QUICK_CONSULT':
        this.performQuickConsultation(data?.question);
        break;
      case 'GET_LAST_CONSULTATION':
        this.sendLastConsultationToWatch();
        break;
      case 'GET_ADVICE':
        this.sendDailyAdviceToWatch();
        break;
      default:
        console.log('[WearOSService] Unknown action:', action);
    }
  }

  // Handle data sync from watch
  handleDataSync(data) {
    console.log('[WearOSService] Data sync:', data);
    // Process synced data (e.g., health metrics for personalized readings)
  }

  // Send daily hexagram to watch
  async sendDailyHexagramToWatch() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/daily-hexagram`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const hexagram = await response.json();
        await this.sendToWatch({
          type: 'DAILY_HEXAGRAM',
          data: {
            number: hexagram.hexagram_number,
            name: hexagram.hexagram_name,
            chinese: hexagram.hexagram_chinese,
            meaning: hexagram.brief_meaning,
            advice: hexagram.daily_advice
          }
        });
      }
    } catch (error) {
      console.error('[WearOSService] Failed to send daily hexagram:', error);
    }
  }

  // Perform quick consultation from watch
  async performQuickConsultation(question) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        await this.sendToWatch({ type: 'ERROR', message: 'Login required' });
        return;
      }

      // Generate random coin tosses for watch consultation
      const coinTosses = {
        line1: Math.floor(Math.random() * 4) + 6,
        line2: Math.floor(Math.random() * 4) + 6,
        line3: Math.floor(Math.random() * 4) + 6,
        line4: Math.floor(Math.random() * 4) + 6,
        line5: Math.floor(Math.random() * 4) + 6,
        line6: Math.floor(Math.random() * 4) + 6
      };

      const response = await fetch(`${API_URL}/api/consultations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: question || 'Quick watch consultation',
          coin_tosses: coinTosses,
          consultation_type: 'direct' // Shorter for watch display
        })
      });

      if (response.ok) {
        const result = await response.json();
        await this.sendToWatch({
          type: 'CONSULTATION_RESULT',
          data: {
            hexagram_number: result.hexagram_number,
            hexagram_name: result.hexagram_name,
            hexagram_chinese: result.hexagram_chinese,
            brief_interpretation: this.truncateForWatch(result.interpretation, 200)
          }
        });
      }
    } catch (error) {
      console.error('[WearOSService] Quick consultation failed:', error);
      await this.sendToWatch({ type: 'ERROR', message: 'Consultation failed' });
    }
  }

  // Send last consultation to watch
  async sendLastConsultationToWatch() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/consultations?limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const consultations = await response.json();
        if (consultations.length > 0) {
          const last = consultations[0];
          await this.sendToWatch({
            type: 'LAST_CONSULTATION',
            data: {
              question: this.truncateForWatch(last.question, 50),
              hexagram_number: last.hexagram_number,
              hexagram_name: last.hexagram_name,
              interpretation: this.truncateForWatch(last.interpretation, 150),
              date: last.created_at
            }
          });
        }
      }
    } catch (error) {
      console.error('[WearOSService] Failed to send last consultation:', error);
    }
  }

  // Send daily advice to watch
  async sendDailyAdviceToWatch() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/advice/current`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const advice = await response.json();
        await this.sendToWatch({
          type: 'DAILY_ADVICE',
          data: {
            advice: this.truncateForWatch(advice.advice_text || advice.preview_message, 200),
            calendar: advice.chinese_calendar
          }
        });
      }
    } catch (error) {
      console.error('[WearOSService] Failed to send advice:', error);
    }
  }

  // Send data to smartwatch
  async sendToWatch(payload) {
    try {
      if (this.isAppleWatch) {
        const { WatchConnectivity } = await import('@nickmessing/capacitor-watch-connectivity').catch(() => null);
        if (WatchConnectivity) {
          await WatchConnectivity.sendMessage({ message: JSON.stringify(payload) });
        }
      } else if (this.isWearOS) {
        const { Wearable } = await import('@nickmessing/capacitor-wearable').catch(() => null);
        if (Wearable) {
          await Wearable.sendMessage({ path: '/iching', data: JSON.stringify(payload) });
        }
      }
      console.log('[WearOSService] Sent to watch:', payload.type);
    } catch (error) {
      console.warn('[WearOSService] Send to watch failed:', error);
    }
  }

  // Truncate text for watch display
  truncateForWatch(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  // Sync complications data (iOS)
  async syncComplications() {
    try {
      const token = localStorage.getItem('token');
      const [hexagramRes, adviceRes] = await Promise.all([
        fetch(`${API_URL}/api/daily-hexagram`),
        fetch(`${API_URL}/api/chinese-calendar`)
      ]);

      const hexagram = hexagramRes.ok ? await hexagramRes.json() : null;
      const calendar = adviceRes.ok ? await adviceRes.json() : null;

      if (this.isAppleWatch) {
        const { WatchConnectivity } = await import('@nickmessing/capacitor-watch-connectivity').catch(() => null);
        if (WatchConnectivity) {
          await WatchConnectivity.updateApplicationContext({
            context: JSON.stringify({
              dailyHexagram: hexagram,
              chineseCalendar: calendar,
              lastUpdate: new Date().toISOString()
            })
          });
        }
      }
    } catch (error) {
      console.error('[WearOSService] Complication sync failed:', error);
    }
  }

  // Update watch tile/glance data (WearOS)
  async updateTileData() {
    try {
      const hexagramRes = await fetch(`${API_URL}/api/daily-hexagram`);
      const hexagram = hexagramRes.ok ? await hexagramRes.json() : null;

      if (this.isWearOS && hexagram) {
        const { Wearable } = await import('@nickmessing/capacitor-wearable').catch(() => null);
        if (Wearable) {
          await Wearable.putDataItem({
            path: '/tile-data',
            data: JSON.stringify({
              hexagram_number: hexagram.hexagram_number,
              hexagram_name: hexagram.hexagram_name,
              brief_meaning: hexagram.brief_meaning
            })
          });
        }
      }
    } catch (error) {
      console.error('[WearOSService] Tile update failed:', error);
    }
  }
}

// Export singleton
export const wearOSService = new WearOSService();
export default wearOSService;