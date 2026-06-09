import { Injectable } from '@nestjs/common';
import { UpdateSettingsDto } from './dto/update-settings.dto';

// In-memory placeholder — replace with a Settings model in Prisma for v1
const defaultSettings = {
  salonName: 'My Salon',
  currency: 'USD',
  taxRate: 8.5,
  tipsEnabled: true,
  receiptSmsEnabled: false,
  receiptEmailEnabled: false,
  timezone: 'America/New_York',
};

let currentSettings = { ...defaultSettings };

@Injectable()
export class SettingsService {
  getSettings(_salonId?: string) {
    return currentSettings;
  }

  updateSettings(dto: UpdateSettingsDto, _salonId?: string) {
    currentSettings = { ...currentSettings, ...dto };
    return currentSettings;
  }

  resetSettings() {
    currentSettings = { ...defaultSettings };
    return currentSettings;
  }
}
