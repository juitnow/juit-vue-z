import { useTranslator } from '@juit/vue-i18n'
import { patterns } from 'quasar'

/** A non-async validation rule */
export interface ZValidator<T> {
  (value: T): boolean | string
}

/** Form validators */
export interface ZValidators {
  /** Assert that the string is a valid email */
  email(): ZValidator<string>
  /** Assert that the string matches a given regex */
  regexp(regExp: RegExp): ZValidator<string>
  /** Assert that the string has the specified maximum length */
  maxLength(length: number): ZValidator<string>
  /** Assert that the string has the specified minimum length */
  minLength(length: number): ZValidator<string>
  /** Assert that the value is not _falsy_ (non zero number, non-empty string) */
  required(): ZValidator<string>
  /** Assert that the number does not exceed this maximum */
  maximum(max: number): ZValidator<number>
  /** Assert that the number is not under this minimum */
  minimum(min: number): ZValidator<number>
}

/** Composition call to return our (localized) validators */
export function useValidators(): ZValidators {
  const { t } = useTranslator()

  function email(): ZValidator<string> {
    return function email(value: string) {
      return patterns.testPattern.email(value) || t({
        en: 'Invalid Email address',
        de: 'Ungültige E-Mail-Adresse',
      })
    }
  }

  function regexp(regExp: RegExp): ZValidator<string> {
    return function regexp(value: string) {
      return !!value.match(regExp) || t({
        en: 'Invalid format',
        de: 'Ungültige Format',
      })
    }
  }

  function maxLength(length: number): ZValidator<string> {
    return function maxLength(value: string) {
      if (value.length <= length) return true

      return t({
        en: 'Maximum length { length } characters',
        de: 'Maximale Länge { length } Zeichen',
      }, { length })
    }
  }

  function minLength(length: number): ZValidator<string> {
    return function minLength(value: string) {
      if (!value) return true // the minLength only should be checked if there is a value
      if (value.length >= length) return true

      return t({
        en: 'Minimum length { length } characters',
        de: 'Mindestlänge { length } Zeichen',
      }, { length })
    }
  }

  function required(): ZValidator<string> {
    return function required(value: string) {
      return (!! value) || t({
        en: 'This field is required',
        de: 'Dieses Feld ist erforderlich',
      })
    }
  }

  function maximum(max: number): ZValidator<number> {
    return function maximum(value: number) {
      if (value <= max) return true
      return t({
        en: 'Maximum { max }',
        de: 'Höchstens { max }',
      }, { max })
    }
  }

  function minimum(min: number): ZValidator<number> {
    return function minimum(value: number) {
      if (value >= min) return true
      return t({
        en: 'Minimum { min }',
        de: 'Mindestens { min }',
      }, { min })
    }
  }

  return { email, regexp, maxLength, minLength, required, maximum, minimum }
}
