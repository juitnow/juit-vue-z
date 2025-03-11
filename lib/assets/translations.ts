import type { Translations } from '@juit/vue-i18n'

export const translations = {
  'search': { en: 'Search', de: 'Suchen' },
  'cancel': { en: 'Cancel', de: 'Abbrechen' },
  'save': { en: 'Save', de: 'Speichern' },
  'validate': { en: 'validate', de: 'Validieren' },
  'delete': { en: 'Delete', de: 'Löschen' },
  'restore': { en: 'Restore', de: 'Wiederherstellen' },
  'edit': { en: 'Edit', de: 'Bearbeiten' },

  'keep': { en: 'Keep', de: 'Behalten' },
  'discard': { en: 'Discard', de: 'Verwerfen' },
  'ignore': { en: 'Ignore', de: 'Ignorieren' },

  'object.uuid': { en: 'UUID', de: 'UUID' },
  'object.created': { en: 'Created on', de: 'Erstellt am' },
  'object.modified': { en: 'Modified on', de: 'Geändert am' },
  'object.deleted': { en: 'Deleted on', de: 'Gelöscht am' },
} as const satisfies Translations
