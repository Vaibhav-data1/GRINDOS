import type { Reminder } from '../core/types';

export function pendingReminders(reminders: Reminder[], now = Date.now()): Reminder[] {
  return reminders.filter((r) => !r.deliveredAt && r.at <= now).sort((a, b) => a.at - b.at);
}

export function acknowledgeReminder(reminder: Reminder, at = Date.now()): Reminder {
  return { ...reminder, acknowledgedAt: at };
}
