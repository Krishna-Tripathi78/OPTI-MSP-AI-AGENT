interface UserPreferences {
  emailNotifications: boolean;
  smsAlerts: boolean;
  weeklyReports: boolean;
  autoLogout: boolean;
  autoLogoutTime: number; // minutes
  language: string;
  timezone: string;
  dashboardRefresh: boolean;
  soundNotifications: boolean;
}

class PreferencesService {
  private storageKey = 'optimsp_preferences';
  private defaultPreferences: UserPreferences = {
    emailNotifications: true,
    smsAlerts: false,
    weeklyReports: true,
    autoLogout: true,
    autoLogoutTime: 30,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dashboardRefresh: true,
    soundNotifications: true
  };

  getPreferences(): UserPreferences {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        return { ...this.defaultPreferences, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Failed to load preferences:', error);
        return this.defaultPreferences;
      }
    }
    return this.defaultPreferences;
  }

  updatePreferences(preferences: Partial<UserPreferences>): void {
    const current = this.getPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(this.storageKey, JSON.stringify(updated));

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('preferencesChanged', { detail: updated }));
  }

  resetToDefaults(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.defaultPreferences));
    window.dispatchEvent(new CustomEvent('preferencesChanged', { detail: this.defaultPreferences }));
  }
}

export const preferencesService = new PreferencesService();