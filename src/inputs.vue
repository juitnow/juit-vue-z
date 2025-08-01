<!-- eslint-disable vue/no-undef-components -->

<template>
  <q-splitter
    v-model="split"
    horizontal
    unit="px"
    class="window-height window-width"
  >
    <template #before>
      <q-scroll-area class="fit">
        <div class="row q-col-gutter-md q-mx-md q-mb-md">
          <div class="col-6 col-sm-4 col-md-3 column">
            <h6>Frills</h6>
            <q-checkbox v-model="label" label="Label" />
            <q-checkbox v-model="placeholder" label="Placeholder" />
            <q-checkbox v-model="hint" label="Hint" />
            <q-checkbox v-model="icon" label="Icon" />
          </div>

          <div class="col-6 col-sm-4 col-md-3 column">
            <h6>Form Props</h6>
            <q-checkbox v-model="bottomSlots" label="Bottom Slots" />
            <q-checkbox v-model="disabled" label="Disabled" />
            <q-checkbox v-model="editable" label="Editable" />
            <q-checkbox v-model="lazyRules" label="Lazy Rules" />
            <q-checkbox v-model="greedy" label="Greedy" />
          </div>

          <div class="col-6 col-sm-4 col-md-3 column">
            <h6>Basics</h6>
            <q-checkbox v-model="required" label="Required" />
            <q-checkbox v-model="clearable" label="Clearable" />
            <q-checkbox v-model="clickable" label="Clickable" />
            <q-checkbox v-model="readonly" label="Readonly" />
          </div>

          <div class="col-6 col-sm-4 col-md-3 column">
            <h6>Extra</h6>
            <q-checkbox v-model="suffix" label="Suffix" />
            <q-checkbox v-model="minLength" label="Min / Min Length" />
            <q-checkbox v-model="maxLength" label="Max / Max Length" />
          </div>

          <div class="col-6 col-sm-4 col-md-3 column">
            <h6>Validation</h6>
            <z-btn
              class="q-my-xs"
              label="Validate"
              color="primary"
              @click="form?.validate()"
            />
            <z-btn
              class="q-my-xs"
              label="Clear"
              color="primary"
              @click="form?.resetValidation()"
            />
            <z-btn
              class="q-my-xs"
              label="Is Ready"
              color="primary"
              @click="warn(form?.isReady ? 'Ready' : 'Not Ready')"
            />
          </div>

          <div class="col-6 col-sm-4 col-md-3 column">
            <h6>Locale</h6>
            <z-btn
              class="q-my-xs"
              color="primary"
              :label="`Switch Locale to ${nextLocale}`"
              @click="switchLocale()"
            />
          </div>

          <div class="col-6 col-sm-4 col-md-3 column">
            <h6>Dialog</h6>
            <z-btn
              class="q-my-xs"
              label="Confirm"
              color="primary"
              @click="confirm()"
            />
            <z-btn
              class="q-my-xs"
              label="Show dialog"
              color="primary"
              @click="dialog?.show()"
            />
            <q-checkbox v-model="persistent" :label="`Persistent (${showing ? 'showing' : 'hidden'})`" />

            <z-dialog
              ref="dialog"
              v-model="showing"
              title="A simple dialog"
              :persistent="persistent"
              @ok="warn(`Dialog OK '${$event}'`)"
              @show="warn(`Dialog Show`)"
              @hide="warn(`Dialog Hide`)"
            >
              <q-card-actions>
                <z-btn
                  class="col"
                  label="Confirm"
                  color="primary"
                  @click="dialog?.confirm('Yoohooo')"
                />
                <z-btn
                  class="col"
                  label="Cancel"
                  color="negative"
                  @click="dialog?.cancel()"
                />
              </q-card-actions>
            </z-dialog>
          </div>
        </div>
      </q-scroll-area>
    </template>

    <template #separator>
      <q-avatar
        color="primary"
        text-color="white"
        size="40px"
        icon="sym_r_drag_indicator"
      />
    </template>

    <template #after>
      <q-scroll-area class="fit">
        <z-form
          ref="form"
          class="q-mx-md q-mb-md"
          :bottom-slots="bottomSlots"
          :editable="editable"
          :disabled="disabled"
          :lazy-rules="lazyRules"
          :greedy="greedy"
          @submit="warn('Submit')"
        >
          <h6>Label</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-label
                class="col-6"
                :value="string"
                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"
                :icon="icon ? 'sym_r_search' : undefined"
                :link="clickable ? { name: 'Home' } : undefined"
              />
              <div class="col-6">
                {{ JSON.stringify(string) }}
              </div>
            </div>
          </div>

          <h6>Label (Minimal)</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-label
                minimal
                class="col-6"
                :value="string"
                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"
                :icon="icon ? 'sym_r_search' : undefined"
                :link="clickable ? { name: 'Home' } : undefined"
              />
              <div class="col-6">
                {{ JSON.stringify(string) }}
              </div>
            </div>
          </div>


          <h6>Text</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-text
                v-model="string"
                class="col-6"

                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"
                :icon="icon ? 'sym_r_search' : undefined"

                :max-length="maxLength ? 30 : undefined"
                :suffix="suffix ? 'suffix' : undefined"
                :required="required"
                :readonly="readonly"

                :on-clear="clearable ? () => string = '' : undefined"
                :on-click="clickable ? () => warn('Clicked') : undefined"
              />
              <div class="col-6">
                {{ JSON.stringify(string) }}
              </div>
            </div>
          </div>

          <h6>String</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-string
                v-model="string"
                class="col-6"

                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"
                :icon="icon ? 'sym_r_search' : undefined"

                :min-length="minLength ? 5 : undefined"
                :max-length="maxLength ? 20 : undefined"
                :suffix="suffix ? 'suffix' : undefined"

                :required="required"
                :readonly="readonly"
              />
              <div class="col-6">
                {{ JSON.stringify(string) }}
              </div>
            </div>
          </div>

          <h6>Password</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-password
                v-model="password"
                class="col-6"

                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"
                :icon="icon ? 'sym_r_search' : undefined"

                :min-length="minLength ? 5 : undefined"

                :required="required"
                :readonly="readonly"
              />
              <div class="col-6">
                {{ JSON.stringify(password) }}
              </div>
            </div>
          </div>

          <h6>Number</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-number
                v-model="number"
                class="col-6"

                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"
                :icon="icon ? 'sym_r_search' : undefined"

                :suffix="suffix ? ' g/L' : undefined"
                :minimum="minLength ? 5 : undefined"
                :maximum="maxLength ? 20 : undefined"

                :readonly="readonly"
              />
              <div class="col-6">
                {{ JSON.stringify(number) }}
              </div>
            </div>
          </div>

          <h6>Nullable Number</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-nullable-number
                v-model="nullableNumber"
                class="col-6"

                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"
                :icon="icon ? 'sym_r_search' : undefined"

                :suffix="suffix ? ' km/H' : undefined"
                :minimum="minLength ? 5 : undefined"
                :maximum="maxLength ? 20 : undefined"

                :required="required"
                :readonly="readonly"
              />
              <div class="col-6">
                {{ JSON.stringify(nullableNumber) }}
              </div>
            </div>
          </div>

          <h6>Euro</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-euro
                v-model="euro"
                class="col-6"

                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"
                :icon="icon ? 'sym_r_search' : undefined"

                :suffix="suffix ? ' EUR' : undefined"
                :minimum="minLength ? 100 : undefined"
                :maximum="maxLength ? 25000 : undefined"

                :required="required"
                :readonly="readonly"
              />
              <div class="col-6">
                {{ JSON.stringify(euro) }} cents
              </div>
            </div>
          </div>

          <h6>EAN 13</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-ean13
                v-model="barcode"
                class="col-6"

                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"
                :icon="icon ? 'sym_r_search' : undefined"

                :required="required"
                :readonly="readonly"
              />
              <div class="col-6">
                {{ JSON.stringify(barcode) }}
              </div>
            </div>
          </div>

          <h6>Tags</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-tags
                v-model="tags"
                class="col-6"

                :label="label ? 'Label' : undefined"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"
                :icon="icon ? 'sym_r_search' : undefined"

                :tags="[ 'foo', 'bar', 'baz', 'zzza', 'yyya', 'xxxa', 'qqqa' ]"

                :readonly="readonly"
              />
              <div class="col-6">
                {{ JSON.stringify(tags) }}
              </div>
            </div>
          </div>

          <h6>Select</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-select
                v-model="selected"
                class="col-6"

                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"
                :icon="icon ? 'sym_r_search' : undefined"

                :clearable="clearable"
                :options="{
                  foo: 'This is Foo',
                  bar: 'And this is Bar',
                  baz: 'But this is Baz',
                }"

                :required="required"
                :readonly="readonly"
              />
              <div class="col-6">
                {{ JSON.stringify(selected) }}
              </div>
            </div>
          </div>

          <h6>Date</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-date
                v-model="date"
                class="col-6"

                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"
                :icon="icon ? 'sym_r_search' : undefined"

                :clearable="clearable ? required ? 'today' : true : false"
                :required="required"
                :readonly="readonly"
              />
              <div class="col-6">
                {{ JSON.stringify(date) }}
              </div>
            </div>
          </div>

          <h6>Date Range</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-date-range
                v-model="dateRange"
                class="col-6"

                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"
                :icon="icon ? 'sym_r_search' : undefined"

                :clearable="clearable ? required ? 'today' : true : false"
                :required="required"
                :readonly="readonly"
              />
              <div class="col-6">
                {{ JSON.stringify(dateRange) }}
              </div>
            </div>
          </div>

          <h6>Picker</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-picker
                ref="picker"
                v-model="pickerShowing"
                class="col-6"
                :value="picked || undefined"

                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"

                icon="sym_r_search"
                :link="clickable ? { name: 'Home' } : undefined"

                :on-clear="clearable ? () => picked = null : undefined"
                :required="required"
                :readonly="readonly"
                @ok="picked = $event"
              >
                <div class="row q-col-gutter-md">
                  <div class="col-4">
                    <z-btn
                      class="full-width"
                      label="Left"
                      color="primary"
                      @click="picker?.confirm('Left')"
                    />
                  </div>
                  <div class="col-4">
                    <z-btn
                      class="full-width"
                      label="Right"
                      color="warning"
                      @click="picker?.confirm('Right')"
                    />
                  </div>
                  <div class="col-4">
                    <z-btn
                      class="full-width"
                      label="Clear"
                      color="negative"
                      @click="picker?.confirm(null)"
                    />
                  </div>
                </div>
              </z-picker>
              <div class="col-6">
                {{ JSON.stringify({ pickerShowing, picked }) }}
              </div>
            </div>
          </div>

          <h6>Autocomplete</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-autocomplete
                v-model="string"
                class="col-6"

                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"
                :icon="icon ? 'sym_r_search' : undefined"

                :required="required"
                :readonly="readonly"
                :clearable="clearable"
                :max-length="maxLength ? 30 : undefined"

                @autocomplete="completions"
                @selected="warn(`Autocompleted '${$event.value}' => '${$event.label}'`)"
              />
              <div class="col-6">
                {{ JSON.stringify(string) }}
              </div>
            </div>
          </div>

          <h6>Address</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-address
                v-model="string"
                class="col-6"

                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"
                :icon="icon ? 'sym_r_search' : undefined"

                :required="required"
                :readonly="readonly"
                :clearable="clearable"
                :max-length="maxLength ? 30 : undefined"
                :region="country"

                @address="warn('Address selected'), address = $event, country = $event.country"
              />
              <div class="col-6">
                {{ JSON.stringify(address) }}
              </div>
            </div>
          </div>

          <h6>Country</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-country
                v-model="country"
                class="col-6"

                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? 'Placeholder' : ''"
                :hint="hint ? 'Hint' : undefined"
                :icon="icon ? 'sym_r_search' : undefined"

                :required="required"
                :readonly="readonly"
                :clearable="clearable"
              />
              <div class="col-6">
                {{ JSON.stringify(country) }}
              </div>
            </div>
          </div>

          <h6>Telephone</h6>
          <div class="bg-shade borders rounded-borders q-pa-sm ">
            <div class="row q-col-gutter-md items-center">
              <z-telephone
                v-model="telephone"
                class="col-6"

                :label="label ? 'Label' : ''"
                :placeholder="placeholder ? '012345678' : ''"
                :hint="hint ? 'Use z-country above to change country' : undefined"
                :icon="icon ? 'sym_r_call' : undefined"
                :lazy-rules="lazyRules"

                :required="required"
                :readonly="readonly"
                :clearable="clearable"

                :country="country"
              />
              <div class="col-6">
                {{ JSON.stringify(telephone) }}
              </div>
            </div>
          </div>
        </z-form>
      </q-scroll-area>
    </template>
  </q-splitter>
</template>

<script setup lang="ts">
import { useTranslator } from '@juit/vue-i18n'
import { useQuasar } from 'quasar'
import { computed, ref } from 'vue'

import { useDialogs } from '../lib'

import type { ZAddressData, ZDateRangeData, ZDialog, ZForm, ZOption, ZPicker } from '../lib'

const _dialogs = useDialogs()
const translator = useTranslator()
const { notify } = useQuasar()

const form = ref<ZForm>()
const picker = ref<ZPicker>()
const dialog = ref<ZDialog>()
const showing = ref(false)
const split = ref(470)
function confirm(): void {
  _dialogs.confirm({
    title: 'Are you sure?',
    message: 'This is a confirmation dialog',
  }).then((ok) => warn(`Confirmation is ${ok}`))
}

const persistent = ref(false)

const label = ref(true)
const placeholder = ref(true)
const hint = ref(true)
const icon = ref(true)

const bottomSlots = ref(true)
const editable = ref(true)
const disabled = ref(false)
const lazyRules = ref(false)
const greedy = ref(false)

const required = ref(false)
const clearable = ref(false)
const clickable = ref(false)
const readonly = ref(false)

const suffix = ref(false)
const minLength = ref(false)
const maxLength = ref(false)

const string = ref('')
const password = ref('')
const number = ref(0)
const nullableNumber = ref<number | null>(null)
const euro = ref(0)
const barcode = ref('')
const tags = ref<string[]>([])
const selected = ref('')
const date = ref('')
const dateRange = ref<ZDateRangeData>()
const picked = ref<'left' |'right' | null>(null)
const pickerShowing = ref(false)
const address = ref<ZAddressData>()
const country = ref<string>()
const telephone = ref<string>()

function warn(message: string): void {
  notify({ message, color: 'grey', group: false })
}

async function completions(text: string): Promise<ZOption[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return [
    { value: 'foo', label: text + 'Foo' },
    { value: 'bar', label: text + 'Bar' },
    { value: 'baz', label: text + 'Baz' },
  ]
}

const nextLocale = computed(() => new Intl.Locale(translator.language === 'en' ? 'de-DE' : 'en-US'))

function switchLocale(): void {
  translator.locale = nextLocale.value
}

</script>

<style lang="postcss" scoped>
.q-page-container {
  margin-left: 20px;
  margin-right: 20px;
}

h6 {
  margin-top: 1em;
  margin-bottom: 0;
}
</style>
