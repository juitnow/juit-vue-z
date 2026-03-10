<template>
  <z-autocomplete
    ref="_zautocomplete"
    v-model="_value"

    :label="label"
    :hint="hint"
    :icon="icon"

    :debounce="debounce"
    :clearable="clearable"

    :max-length="maxLength"
    :required="required"
    :rules="rules"

    :readonly="readonly"
    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :lazy-rules="lazyRules"

    @autocomplete="_predictAddress"
    @selected="_fillAddress"
  >
    <template #option="scope">
      <q-item v-bind="scope.itemProps" dense>
        <q-item-section>
          <div>
            <span
              v-for="(token, i) in (scope.opt.tokens as AddressToken[])"
              :key="`${scope.opt.value}.${i}`"
              :class="`autocomplete-${token.type}`"
            >
              {{ token.value }}
            </span>
          </div>
        </q-item-section>
      </q-item>
    </template>
  </z-autocomplete>
</template>

<script setup lang="ts">
import { useTranslator } from '@juit/vue-i18n'
import { QItem, QItemSection } from 'quasar'
import { onMounted, ref } from 'vue'

import { componentFormProps } from '../utils/form'
import ZAutocomplete from './autocomplete.vue'

import type { PropType } from 'vue'
import type { ZValidator } from '../composition/validators'
import type { ZAddressData, ZOption } from '../types'

const { locale } = useTranslator()

const _zautocomplete = ref<InstanceType<typeof ZAutocomplete>>()

/* ===== NAME, PROPS, MODEL, ... ============================================ */

defineOptions({ name: 'ZAddress' })

const _props = defineProps({

  /* ===== FRILLS =========================================================== */

  /** The label for this input text */
  label: {
    type: String,
    required: true,
  },
  /** The hint to display below the input field */
  hint: {
    type: String as PropType<string | undefined>,
    required: false,
    default: undefined,
  },
  /** The icon to display within the control */
  icon: {
    type: String as PropType<string | undefined>,
    required: false,
    default: undefined,
  },

  /* ===== OTHER OPTIONS ==================================================== */

  /** Debounce input for the specified amount of time (default: 250ms) */
  debounce: {
    type: Number,
    required: false,
    default: 250,
  },
  /** Clearable, when clicked value will become the empty string */
  clearable: {
    type: Boolean,
    required: false,
    default: false,
  },

  /* ===== GOOGLE MAPS ====================================================== */

  /** Region to bias results in (e.g. DE) */
  region: {
    type: String as PropType<string | undefined>,
    required: false,
    default: undefined,
  },

  /* ===== VALIDATION ======================================================= */

  /** Clearable, when clicked value will become the empty string */
  maxLength: {
    type: Number as PropType<number>,
    required: false,
    default: 0,
  },
  /** Required */
  required: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** The validation rules to apply to this field */
  rules: {
    type: Array as PropType<ZValidator<string>[]>,
    required: false,
    default: () => [],
  },

  ...componentFormProps,
})

/** The *text* value of the input */
const _value = defineModel({
  type: String as PropType<string >,
  required: false,
  default: '',
})

const _emit = defineEmits<{
  (event: 'address', value: ZAddressData, foo?: boolean): void,
}>()

/* Exposed stuff */
defineExpose({
  /** Focus on this control */
  focus: () => _zautocomplete.value?.focus(),
})

/* ===== Google Maps Autocomplete =========================================== */

type AddressToken = { value: string, type: 'match' | 'miss' | 'secondary' }
type AddressPrediction = ZOption & { tokens: AddressToken[] }

async function _predictAddress(value: string): Promise<{ value: string, label: string }[]> {
  if (! globalThis.google?.maps?.places?.AutocompleteSuggestion) {
    throw new Error('Google Maps AutocompleteSuggestion not available')
  }

  if (! value) return [] // should never happen, but still

  const { AutocompleteSuggestion: _AutocompleteSuggestion } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary

  // Prepare our request
  const request = {
    input: value,
    language: locale.toString(),
    // restrict autocomplete to generic address-like results, excluding POIs
    includedPrimaryTypes: [ 'street_address', 'route', 'premise', 'subpremise' ],
    // restrict results to the current country or specified region
    region: _props.region || undefined,
  } satisfies google.maps.places.AutocompleteRequest

  // Get place predictions from Google
  const response = await _AutocompleteSuggestion.fetchAutocompleteSuggestions(request)

  // Process predictions and extract tokens
  const predictions: AddressPrediction[] = []
  for (const suggestion of response.suggestions) {
    const prediction = suggestion.placePrediction
    if (!prediction) continue

    // remove establishments and points of interest
    if (prediction.types.includes('establishment') || prediction.types.includes('point_of_interest')) continue

    // build the predicted addresses
    const placeId = prediction.placeId
    if (!placeId) continue
    const mainText = prediction.mainText?.toString() || prediction.text?.toString() || ''
    const secondary = prediction.secondaryText?.toString() || ''

    const current: AddressPrediction = {
      value: placeId,
      label: prediction.text?.toString() || '',
      tokens: [],
    }

    // the main part of the address (street name)
    if (mainText) {
      // the part of the street name that matches the string input by the user > will be displayed in bold
      current.tokens.push({ value: mainText.slice(0, value.length), type: 'match' })
      // the rest of the street name
      current.tokens.push({ value: mainText.slice(value.length), type: 'miss' })
    }
    // the secondary part (neighborhood, city, country) > will be displayed in smaller font
    if (secondary) current.tokens.push({ value: ` - ${secondary}`, type: 'secondary' })

    predictions.push(current)
  }

  // Return our predictions
  return predictions
}

async function _fillAddress(option: ZOption): Promise<void> {
  if (! globalThis.google?.maps?.places?.Place) {
    throw new Error('Google Maps Place not available')
  }

  const place = new google.maps.places.Place({ id: option.value })
  await place.fetchFields({ fields: [ 'addressComponents' ] })

  const address: ZAddressData = {}
  for (const component of place.addressComponents || []) {
    for (const type of component.types) {
      switch (type) {
        case 'route': address.street_name = component.longText || ''; break
        case 'street_number': address.house_number = component.longText || ''; break
        case 'postal_code': address.postal_code = component.longText || ''; break
        case 'locality': address.city = component.longText || ''; break
        case 'country': address.country = component.shortText || undefined; break // short!
      }
    }
  }

  // emit our address
  _emit('address', address)
}

/* ===== SETUP ============================================================== */

/* Ensure the QSelect ref is set */
onMounted(() => {
  if (! _zautocomplete.value) throw new Error('No ZAutocomplete ref')
})
</script>

<style lang="postcss" scoped>
.autocomplete-match {
  font-weight: 700;
}

.autocomplete-miss {
  font-weight: 400;
}

.autocomplete-secondary {
  font-size: 0.75em;
}
</style>
