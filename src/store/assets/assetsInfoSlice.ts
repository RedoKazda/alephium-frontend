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

// TODO: Same as in desktop wallet

import { ALPH, TokenInfo } from '@alephium/token-list'
import { createSlice, EntityState } from '@reduxjs/toolkit'

import { syncNetworkTokensInfo } from '~/store/assets/assetsActions'
import { assetsInfoAdapter } from '~/store/assets/assetsAdapter'
import { customNetworkSettingsSaved, networkPresetSwitched } from '~/store/networkSlice'

interface AssetsInfoState extends EntityState<TokenInfo> {
  status: 'initialized' | 'uninitialized'
}

const initialState: AssetsInfoState = assetsInfoAdapter.addOne(
  assetsInfoAdapter.getInitialState({
    status: 'uninitialized'
  }),
  {
    ...ALPH
  }
)

const assetsSlice = createSlice({
  name: 'assetsInfo',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncNetworkTokensInfo.fulfilled, (state, action) => {
        const metadata = action.payload

        if (metadata) {
          assetsInfoAdapter.upsertMany(state, metadata.tokens)
          state.status = 'initialized'
        }
      })
      .addCase(networkPresetSwitched, resetState)
      .addCase(customNetworkSettingsSaved, resetState)
  }
})

export default assetsSlice

// Reducers helper functions

const resetState = () => initialState
