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
  'object.created_by': { en: 'Created by', de: 'Erstellt von' },
  'object.modified': { en: 'Modified on', de: 'Bearbeitet am' },
  'object.modified_by': { en: 'Modified by', de: 'Bearbeitet von' },
  'object.deleted': { en: 'Deleted on', de: 'Gelöscht am' },
} as const satisfies Translations
