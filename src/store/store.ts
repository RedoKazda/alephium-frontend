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

import { configureStore } from '@reduxjs/toolkit'

import activeWalletSlice from '~/store/activeWalletSlice'
import addressDiscoverySlice from '~/store/addressDiscoverySlice'
import contactsSlice from '~/store/addresses/contactsSlice'
import addressesSlice from '~/store/addressesSlice'
import appSlice from '~/store/appSlice'
import assetsInfoSlice from '~/store/assets/assetsInfoSlice'
import { priceApi } from '~/store/assets/priceApiSlice'
import confirmedTransactionsSlice from '~/store/confirmedTransactionsSlice'
import credentialsSlice from '~/store/credentialsSlice'
import networkSlice from '~/store/networkSlice'
import pendingTransactionsSlice from '~/store/pendingTransactionsSlice'
import settingsSlice, { settingsListenerMiddleware } from '~/store/settingsSlice'
import walletGenerationSlice from '~/store/walletGenerationSlice'

export const store = configureStore({
  reducer: {
    walletGeneration: walletGenerationSlice.reducer,
    network: networkSlice.reducer,
    settings: settingsSlice.reducer,
    credentials: credentialsSlice.reducer,
    activeWallet: activeWalletSlice.reducer,
    addresses: addressesSlice.reducer,
    [priceApi.reducerPath]: priceApi.reducer,
    app: appSlice.reducer,
    [assetsInfoSlice.name]: assetsInfoSlice.reducer,
    addressDiscovery: addressDiscoverySlice.reducer,
    confirmedTransactions: confirmedTransactionsSlice.reducer,
    pendingTransactions: pendingTransactionsSlice.reducer,
    [contactsSlice.name]: contactsSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(settingsListenerMiddleware.middleware).prepend(priceApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
