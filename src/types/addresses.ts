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

import { AddressKeyPair } from '@alephium/sdk'
import { AddressInfo, Transaction } from '@alephium/sdk/api/explorer'

import { TimeInMs } from './numbers'
import { AddressToken } from './tokens'
import { PendingTransaction } from './transactions'

export type AddressHash = string

export type AddressIndex = number

export type AddressSettings = {
  isMain: boolean
  label?: string
  color?: string
}

export type AddressMetadata = AddressSettings & {
  index: AddressIndex
}

// 🚨 See anti-pattern alerts in src/store/addressesSlice.ts
export type Address = AddressKeyPair & {
  group: number
  settings: AddressSettings
  transactions: (Transaction['hash'] | PendingTransaction['hash'])[]
  transactionsPageLoaded: number
  allTransactionPagesLoaded: boolean
  networkData: {
    details: AddressInfo
    lastUsed: TimeInMs
    tokens: AddressToken[]
  }
}

export type AddressPartial = AddressKeyPair & { settings: AddressSettings }

export type AddressDiscoveryGroupData = {
  highestIndex: AddressIndex | undefined
  gap: number
}
