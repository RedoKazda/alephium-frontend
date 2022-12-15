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

import { NavigationState } from '@react-navigation/routers'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { appReset } from './actions'

const sliceName = 'appMetadata'

export interface AppMetadataState {
  lastNavigationState?: NavigationState
  isCameraOpen: boolean
}

const initialState: AppMetadataState = {
  lastNavigationState: undefined,
  isCameraOpen: false
}

const appMetadataSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    routeChanged: (state, action: PayloadAction<AppMetadataState['lastNavigationState']>) => {
      state.lastNavigationState = action.payload
    },
    cameraToggled: (state, action: PayloadAction<AppMetadataState['isCameraOpen']>) => {
      state.isCameraOpen = action.payload
    }
  },
  extraReducers(builder) {
    builder.addCase(appReset, () => initialState)
  }
})

export const { routeChanged, cameraToggled } = appMetadataSlice.actions

export default appMetadataSlice
