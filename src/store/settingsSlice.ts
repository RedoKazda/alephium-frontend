/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { createListenerMiddleware, createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'

import { defaultGeneralSettings, persistSettings } from '../persistent-storage/settings'
import { GeneralSettings } from '../types/settings'
import { appReset } from './actions'
import { RootState } from './store'

const sliceName = 'settings'

const initialState: GeneralSettings = defaultGeneralSettings

const settingsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    storedGeneralSettingsLoaded: (_, action: PayloadAction<GeneralSettings>) => action.payload,
    themeChanged: (state, action: PayloadAction<GeneralSettings['theme']>) => {
      state.theme = action.payload
    },
    discreetModeToggled: (state) => {
      state.discreetMode = !state.discreetMode
    },
    passwordRequirementToggled: (state) => {
      state.requireAuth = !state.requireAuth
    },
    currencySelected: (state, action: PayloadAction<GeneralSettings['currency']>) => {
      state.currency = action.payload
    }
  },
  extraReducers(builder) {
    builder.addCase(appReset, () => initialState)
  }
})

export const {
  storedGeneralSettingsLoaded,
  themeChanged,
  discreetModeToggled,
  passwordRequirementToggled,
  currencySelected
} = settingsSlice.actions

export const settingsListenerMiddleware = createListenerMiddleware()

// When the settings change, store them in persistent storage
settingsListenerMiddleware.startListening({
  matcher: isAnyOf(themeChanged, discreetModeToggled, passwordRequirementToggled, currencySelected),
  effect: async (_, { getState }) => {
    const state = getState() as RootState

    await persistSettings('general', state[sliceName])
  }
})

export default settingsSlice
