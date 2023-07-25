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

import { TokenList } from '@alephium/token-list'
import { hexToString } from '@alephium/web3'

import client from '@/api/client'
import {
  AssetBase,
  NFTFile,
  UnverifiedFungibleTokenMetadata,
  UnverifiedNFTMetadata,
  VerifiedFungibleTokenMetadata
} from '@/types/assets'
import { NetworkType } from '@/types/network'
import { createQueriesCollection } from '@/utils/api'

export const assetsQueries = createQueriesCollection({
  type: {
    one: (assetId: string) => ({
      queryKey: ['assetType', assetId],
      queryFn: (): Promise<AssetBase> => client.node.guessStdTokenType(assetId).then((r) => ({ id: assetId, type: r })),
      staleTime: Infinity
    })
  },
  metadata: {
    allVerifiedTokens: (network: NetworkType) => ({
      queryKey: ['verifiedTokens', network],
      queryFn: (): Promise<VerifiedFungibleTokenMetadata[]> => {
        try {
          return fetch(`https://raw.githubusercontent.com/alephium/token-list/master/tokens/${network}.json`).then(
            (r) => r.json().then((j: TokenList) => j.tokens.map((v) => ({ ...v, type: 'fungible', verified: true })))
          )
        } catch (e) {
          console.error(e)
          return Promise.reject(new Error('Verified token fetch failed'))
        }
      },
      staleTime: Infinity
    }),
    unverifiedFungibleToken: (assetId: string) => ({
      queryKey: ['unverifiedFungibleToken', assetId],
      queryFn: (): Promise<UnverifiedFungibleTokenMetadata> =>
        client.node.fetchFungibleTokenMetaData(assetId).then((r) => ({
          ...r,
          id: assetId,
          name: hexToString(r.name),
          symbol: hexToString(r.symbol),
          type: 'fungible',
          verified: false
        })),
      staleTime: Infinity
    }),
    unverifiedNFT: (assetId: string) => ({
      queryKey: ['unverifiedNFT', assetId],
      queryFn: (): Promise<UnverifiedNFTMetadata> =>
        client.node
          .fetchNFTMetaData(assetId)
          .then((r) => ({ ...r, id: assetId, type: 'non-fungible', verified: false })),
      staleTime: Infinity
    })
  },
  nftFile: {
    detail: (assetId: string, dataUri: string) => ({
      queryKey: ['nftFile', assetId],
      queryFn: (): Promise<NFTFile> | undefined =>
        fetch(dataUri).then((res) => res.json().then((f) => ({ ...f, assetId }))),
      staleTime: Infinity
    })
  },
  // TODO: This may be moved in a balancesApi file in the future?
  balances: {
    addressToken: (addressHash: string, tokenId: string) => ({
      queryKey: ['addressTokenBalance', addressHash, tokenId],
      queryFn: () =>
        client.explorer.addresses
          .getAddressesAddressTokensTokenIdBalance(addressHash, tokenId)
          .then((balance) => ({ ...balance, id: tokenId }))
    })
  }
})
