import { useTranslator } from '@juit/vue-i18n'
import { useQuasar } from 'quasar'

import { icons } from '../assets/icons'
import { translations } from '../assets/translations'
import JConfirmDialog from '../dialogs/confirm.vue'
import JProgressDialog from '../dialogs/progress.vue'

/** Our dialogs */
export interface ZDialogs {
  /**
   * Very basic confirm/cancel dialog with a title and a message.
   *
   * @returns - `true` on confirm/ok, `false` on cancel
   */
  confirm(options: {
    title: string,
    message: string,
    confirm?: string,
    confirmIcon?: string,
    confirmColor?: string,
    cancel?: string,
    cancelIcon?: string,
    cancelColor?: string,
  }): Promise<boolean>

  /** Confirm whether to discard changes or not */
  confirmDiscard(): Promise<boolean>

  /** Confirm whether to delete a record or not */
  confirmDelete(): Promise<boolean>

  /** Confirm whether to restore a record or not */
  confirmRestore(): Promise<boolean>

  /**
   * Show a progress dialog with a title and a message.
   *
   * When `total` is set, the `progress` prop should be a number between zero
   * and `total - 1`, and progress is shown `progress / total`.
   *
   * When `total` is not set (or zero) the `progress` prop should be a number
   * between zero and 1 and the progress will be shown as a percentage.
   *
   * When the `onCancel` callback (optional) is specified, a cancel button is
   * added to the dialog, and pressing it will invoke the callback. It's up to
   * the caller to handle the cancellation.
   *
   * The returned object has two methods:
   *
   * - `update(progress: number)`: update the `progress` prop
   * - `done()`: close the dialog (must be called, the dialog won't close itself)
   */
  progress(options: {
    title: string,
    message: string,
    progress?: number,
    total?: number,
    onCancel?: () => void,
  }): { update: (progress: number) => void, done: () => void }
}

export function useDialogs(): ZDialogs {
  const { t } = useTranslator()
  const { dialog } = useQuasar()

  function confirm(options: {
    title: string,
    message: string,
    confirm?: string,
    confirmIcon?: string,
    confirmColor?: string,
    cancel?: string,
    cancelIcon?: string,
    cancelColor?: string,
  }): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const instance = dialog({
        component: JConfirmDialog,
        componentProps: { ...options },
      })
      instance.onOk(() => resolve(true))
      instance.onCancel(() => resolve(false))
    })
  }

  function confirmDiscard(): Promise<boolean> {
    return confirm({
      title: t({
        en: 'Discard changes?',
        de: 'Änderungen verwerfen?',
      }),
      message: t({
        en: 'Are you sure you want to discard your changes?',
        de: 'Möchten Sie Ihre Änderungen wirklich verwerfen?',
      }),
      confirm: t(translations.discard),
      confirmIcon: icons.delete,
      confirmColor: 'negative',

      cancel: t(translations.keep),
      cancelIcon: icons.edit,
      cancelColor: 'primary',
    })
  }

  function confirmDelete(): Promise<boolean> {
    return confirm({
      title: t({
        en: 'Delete',
        de: 'Löschen',
      }),
      message: t({
        en: 'Are you sure you want to delete this record?',
        de: 'Möchten Sie diesen Datensatz wirklich löschen?',
      }),

      confirm: t(translations.delete),
      confirmIcon: icons.delete,
      confirmColor: 'negative',

      cancel: t(translations.keep),
      cancelIcon: icons.confirm,
      cancelColor: 'primary',
    })
  }

  function confirmRestore(): Promise<boolean> {
    return confirm({
      title: t({
        en: 'Restore',
        de: 'Wiederherstellen',
      }),
      message: t({
        en: 'Are you sure you want to restore this record?',
        de: 'Möchten Sie diesen Datensatz wirklich wiederherstellen?',
      }),

      confirm: t(translations.restore),
      confirmIcon: icons.restore,
      confirmColor: 'warning',

      cancel: t(translations.ignore),
      cancelIcon: icons.cancel,
      cancelColor: 'primary',
    })
  }

  function progress(options: {
    title: string,
    message: string,
    progress?: number,
    total?: number,
    onCancel?: () => void,
  }): { update: (progress: number) => void, done: () => void } {
    const instance = dialog({
      component: JProgressDialog,
      componentProps: {
        title: options.title,
        message: options.message,
        progress: options.progress || 0,
        total: options.total || 0,
        onCancel: options.onCancel,
      },
    })

    return {
      update: (progress: number) => instance.update({ progress }),
      done: () => instance.hide(),
    }
  }

  return { confirm, confirmDiscard, confirmDelete, confirmRestore, progress }
}
