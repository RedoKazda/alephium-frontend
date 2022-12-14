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

import { defaultNetwork, defaultNetworkSettings, networkPresetSettings, storeSettings } from '../storage/settings'
import { NetworkName, NetworkPreset, NetworkStatus } from '../types/network'
import { NetworkSettings } from '../types/settings'
import { getNetworkName } from '../utils/settings'
import { RootState } from './store'

const sliceName = 'network'

interface NetworkState {
  name: NetworkName
  settings: NetworkSettings
  status: NetworkStatus
}

const initialState: NetworkState = {
  name: defaultNetwork,
  settings: defaultNetworkSettings,
  status: 'uninitialized'
}

const networkSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    networkChanged: (_, action: PayloadAction<NetworkPreset>) => {
      const networkName = action.payload

      return {
        name: networkName,
        settings: networkPresetSettings[networkName],
        status: 'connecting'
      }
    },
    networkSettingsChanged: (_, action: PayloadAction<NetworkSettings>) => {
      const networkSettings = action.payload
      const missingNetworkSettings = !networkSettings.nodeHost || !networkSettings.explorerApiHost

      return {
        name: getNetworkName(networkSettings),
        settings: networkSettings,
        status: missingNetworkSettings ? 'offline' : 'connecting'
      }
    },
    apiClientInitSucceeded: (state) => {
      state.status = 'online'
    },
    apiClientInitFailed: (state) => {
      state.status = 'offline'
    }
  }
})

export const { networkChanged, networkSettingsChanged, apiClientInitSucceeded, apiClientInitFailed } =
  networkSlice.actions

export const networkListenerMiddleware = createListenerMiddleware()

// When the network settings change, store them in persistent storage
networkListenerMiddleware.startListening({
  matcher: isAnyOf(networkChanged, networkSettingsChanged),
  effect: async (_, { getState }) => {
    const state = getState() as RootState

    await storeSettings('network', state[sliceName].settings)
  }
})

export default networkSlice
