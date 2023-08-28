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

import '@walletconnect/react-native-compat'

import { AssetAmount, getHumanReadableError } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { ChainInfo, parseChain, PROVIDER_NAMESPACE, RelayMethod } from '@alephium/walletconnect-provider'
import {
  ApiRequestArguments,
  node,
  SignDeployContractTxParams,
  SignExecuteScriptTxParams,
  SignTransferTxParams
} from '@alephium/web3'
import { SignResult } from '@alephium/web3/dist/src/api/api-alephium'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import SignClient from '@walletconnect/sign-client'
import { EngineTypes, SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { partition } from 'lodash'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

import client from '~/api/client'
import { useSendContext } from '~/contexts/SendContext'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { TxType } from '~/types/transactions'
import { WALLETCONNECT_ERRORS } from '~/utils/constants'

type RequestEvent = SignClientTypes.EventArguments['session_request']
type ProposalEvent = SignClientTypes.EventArguments['session_proposal']

type WalletConnectSessionState = 'uninitialized' | 'proposal' | 'initialized'

interface WalletConnectContextValue {
  walletConnectClient?: SignClient
  requestEvent?: RequestEvent
  proposalEvent?: ProposalEvent
  requiredChainInfo?: ChainInfo
  wcSessionState: WalletConnectSessionState
  onSessionRequestSuccess: (event: RequestEvent, result: node.SignResult) => Promise<void>
  onSessionDelete: () => void
  sessionTopic?: string
  onProposalApprove: (topic: string) => void
  connectedDAppMetadata?: ProposalEvent['params']['proposer']['metadata']
}

const initialValues: WalletConnectContextValue = {
  walletConnectClient: undefined,
  requestEvent: undefined,
  proposalEvent: undefined,
  requiredChainInfo: undefined,
  wcSessionState: 'uninitialized',
  onSessionRequestSuccess: () => Promise.resolve(),
  onSessionDelete: () => null,
  sessionTopic: undefined,
  onProposalApprove: () => null,
  connectedDAppMetadata: undefined
}

const WalletConnectContext = createContext(initialValues)

export const WalletConnectContextProvider = ({ children }: { children: ReactNode }) => {
  const navigation = useNavigation<NavigationProp<SendNavigationParamList>>()
  const {
    setToAddress,
    setFromAddress,
    setAssetAmounts,
    setGasAmount,
    setGasPrice,
    setBytecode,
    setBuildTxCallbacks,
    setSendWorkflowType,
    setInitialAlphAmount,
    setIssueTokenAmount
  } = useSendContext()

  const [walletConnectClient, setWalletConnectClient] = useState<WalletConnectContextValue['walletConnectClient']>()
  const [requestEvent, setRequestEvent] = useState(initialValues.requestEvent)
  const [wcSessionState, setWcSessionState] = useState(initialValues.wcSessionState)
  const [proposalEvent, setProposalEvent] = useState(initialValues.proposalEvent)
  const [requiredChainInfo, setRequiredChainInfo] = useState(initialValues.requiredChainInfo)
  const [sessionTopic, setSessionTopic] = useState(initialValues.sessionTopic)
  const [connectedDAppMetadata, setConnectedDappMetadata] = useState(initialValues.connectedDAppMetadata)

  const initializeWalletConnectClient = useCallback(async () => {
    try {
      console.log('initializing client')
      const client = await SignClient.init({
        projectId: '6e2562e43678dd68a9070a62b6d52207',
        relayUrl: 'wss://relay.walletconnect.com',
        metadata: {
          name: 'Alephium mobile wallet',
          description: 'Alephium mobile wallet',
          url: 'https://github.com/alephium/mobile-wallet',
          icons: ['https://alephium.org/favicon-32x32.png']
        }
      })

      setWalletConnectClient(client)

      console.log('initialized client')
    } catch (e) {
      console.error('Could not initialize WalletConnect client', e)
    }
  }, [])

  useEffect(() => {
    if (!walletConnectClient) initializeWalletConnectClient()
  }, [initializeWalletConnectClient, walletConnectClient])

  const onSessionRequestResponse = useCallback(
    async (event: RequestEvent, response: EngineTypes.RespondParams['response']) => {
      if (!walletConnectClient) return

      console.log('onSessionRequestResponse called')
      console.log('onSessionRequestResponse event', event)
      console.log('onSessionRequestResponse response', response)

      await walletConnectClient.respond({ topic: event.topic, response })
      setRequestEvent(undefined)
    },
    [walletConnectClient]
  )

  const onSessionRequestSuccess = async (event: RequestEvent, result: SignResult) => {
    console.log('onSessionRequestSuccess called')
    console.log('onSessionRequestSuccess event', event)
    console.log('onSessionRequestSuccess result', result)

    await onSessionRequestResponse(event, { id: event.id, jsonrpc: '2.0', result })
  }

  const onSessionRequestError = useCallback(
    async (event: RequestEvent, error: ReturnType<typeof getSdkError>) =>
      await onSessionRequestResponse(event, { id: event.id, jsonrpc: '2.0', error }),
    [onSessionRequestResponse]
  )

  const onSessionRequest = useCallback(
    async (event: RequestEvent) => {
      if (!walletConnectClient) return

      console.log('')
      console.log('onSessionRequest called')
      console.log('onSessionRequestevent', event)
      console.log('')

      setRequestEvent(event)
      setBuildTxCallbacks({
        onBuildSuccess: () => navigation.navigate('SendNavigation', { screen: 'VerifyScreen' }),
        onConsolidationSuccess: () => navigation.navigate('TransfersScreen')
      })

      const {
        params: { request }
      } = event

      try {
        switch (request.method as RelayMethod) {
          case 'alph_signAndSubmitTransferTx': {
            const p = request.params as SignTransferTxParams
            const dest = p.destinations[0]

            setToAddress(p.signerAddress)
            setFromAddress(p.destinations[0].address)
            setAssetAmounts([
              { id: ALPH.id, amount: BigInt(dest.attoAlphAmount) },
              ...(dest.tokens ? dest.tokens.map((token) => ({ ...token, amount: BigInt(token.amount) })) : [])
            ])
            setGasAmount(p.gasAmount)
            setGasPrice(p.gasPrice?.toString())

            console.log('SETTING SEND WORKFLOW TYPE TO OPEN MODAL TO TRANSFER')
            setSendWorkflowType(TxType.TRANSFER)

            break
          }
          case 'alph_signAndSubmitDeployContractTx': {
            const { initialAttoAlphAmount, bytecode, issueTokenAmount, gasAmount, gasPrice, signerAddress } =
              request.params as SignDeployContractTxParams
            const initialAlphAmount: AssetAmount | undefined = initialAttoAlphAmount
              ? { id: ALPH.id, amount: BigInt(initialAttoAlphAmount) }
              : undefined

            setFromAddress(signerAddress)
            setGasAmount(gasAmount)
            setGasPrice(gasPrice?.toString())
            setBytecode(bytecode)
            setInitialAlphAmount(initialAlphAmount)
            setIssueTokenAmount(issueTokenAmount?.toString())

            console.log('SETTING SEND WORKFLOW TYPE TO OPEN MODAL TO DEPLOY_CONTRACT')
            setSendWorkflowType(TxType.DEPLOY_CONTRACT)

            break
          }
          case 'alph_signAndSubmitExecuteScriptTx': {
            const { tokens, bytecode, gasAmount, gasPrice, signerAddress, attoAlphAmount } =
              request.params as SignExecuteScriptTxParams
            let assetAmounts: AssetAmount[] = []
            let allAlphAssets: AssetAmount[] = attoAlphAmount ? [{ id: ALPH.id, amount: BigInt(attoAlphAmount) }] : []
            if (tokens) {
              const assets = tokens.map((token) => ({ id: token.id, amount: BigInt(token.amount) }))
              const [alphAssets, tokenAssets] = partition(assets, (asset) => asset.id === ALPH.id)
              assetAmounts = tokenAssets
              allAlphAssets = [...allAlphAssets, ...alphAssets]
            }
            if (allAlphAssets.length > 0) {
              assetAmounts.push({
                id: ALPH.id,
                amount: allAlphAssets.reduce((total, asset) => total + (asset.amount ?? BigInt(0)), BigInt(0))
              })
            }

            console.log('BUILDING FROM WC CONTEXT AFTER PARSING EVENT')
            console.log('fromAddress', signerAddress)
            console.log('assetAmounts', assetAmounts)
            console.log('assetAmounts', assetAmounts)
            console.log('gasAmount', gasAmount)
            console.log('gasPrice', gasPrice)
            console.log('bytecode', bytecode)

            setFromAddress(signerAddress)
            setAssetAmounts(assetAmounts)
            setGasAmount(gasAmount)
            setGasPrice(gasPrice?.toString())
            setBytecode(bytecode)

            console.log('SETTING SEND WORKFLOW TYPE TO OPEN MODAL TO SCRIPT')
            setSendWorkflowType(TxType.SCRIPT)

            break
          }
          case 'alph_requestNodeApi': {
            const p = request.params as ApiRequestArguments
            const result = await client.node.request(p)
            await walletConnectClient.respond({
              topic: event.topic,
              response: { id: event.id, jsonrpc: '2.0', result }
            })
            break
          }
          case 'alph_requestExplorerApi': {
            const p = request.params as ApiRequestArguments
            // TODO: Remove following code when using explorer client from web3 library
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const call = (client.explorer as any)[`${p.path}`][`${p.method}`] as (...arg0: any[]) => Promise<any>
            const result = await call(...p.params)
            await walletConnectClient.respond({
              topic: event.topic,
              response: { id: event.id, jsonrpc: '2.0', result }
            })
            break
          }
          default:
            // TODO: support all of the other SignerProvider methods
            onSessionRequestError(event, getSdkError('WC_METHOD_UNSUPPORTED'))
            throw new Error(`Method not supported: ${request.method}`)
        }
      } catch (e) {
        console.error('Error while parsing WalletConnect session request', e)
        // posthog.capture('Error', { message: 'Could not parse WalletConnect session request' })
        onSessionRequestError(event, {
          message: getHumanReadableError(e, 'Error while parsing WalletConnect session request'),
          code: WALLETCONNECT_ERRORS.PARSING_SESSION_REQUEST_FAILED
        })
      }
    },
    [
      navigation,
      onSessionRequestError,
      setAssetAmounts,
      setBuildTxCallbacks,
      setBytecode,
      setFromAddress,
      setGasAmount,
      setGasPrice,
      setInitialAlphAmount,
      setIssueTokenAmount,
      setSendWorkflowType,
      setToAddress,
      walletConnectClient
    ]
  )

  const onSessionProposal = useCallback(async (proposalEvent: ProposalEvent) => {
    console.log('')
    console.log('onSessionProposal called')
    console.log('onSessionProposal proposalEvent', proposalEvent)
    console.log('')

    const { requiredNamespaces } = proposalEvent.params
    const requiredChains = requiredNamespaces[PROVIDER_NAMESPACE].chains
    const requiredChainInfo = requiredChains ? parseChain(requiredChains[0]) : undefined

    setRequiredChainInfo(requiredChainInfo)
    setProposalEvent(proposalEvent)
    setWcSessionState('proposal')
  }, [])

  const onSessionDelete = useCallback(() => {
    console.log('')
    console.log('onSessionDelete called')
    console.log('')

    setRequiredChainInfo(undefined)
    setProposalEvent(undefined)
    setWcSessionState('uninitialized')
    setSessionTopic(undefined)
  }, [])

  const onProposalApprove = (topic: string) => {
    console.log('')
    console.log('onProposalApprove called, topic:', topic)
    console.log('')

    setSessionTopic(topic)
    setConnectedDappMetadata(proposalEvent?.params.proposer.metadata)
    setProposalEvent(undefined)
    setWcSessionState('initialized')
  }

  useEffect(() => {
    if (!walletConnectClient) return

    walletConnectClient.on('session_request', onSessionRequest)
    walletConnectClient.on('session_proposal', onSessionProposal)
    walletConnectClient.on('session_delete', onSessionDelete)

    return () => {
      walletConnectClient.off('session_request', onSessionRequest)
      walletConnectClient.off('session_proposal', onSessionProposal)
      walletConnectClient.off('session_delete', onSessionDelete)
    }
  }, [onSessionDelete, onSessionProposal, onSessionRequest, walletConnectClient])

  return (
    <WalletConnectContext.Provider
      value={{
        walletConnectClient,
        proposalEvent,
        wcSessionState,
        requestEvent,
        requiredChainInfo,
        sessionTopic,
        onSessionDelete,
        onProposalApprove,
        connectedDAppMetadata,
        onSessionRequestSuccess
      }}
    >
      {children}
    </WalletConnectContext.Provider>
  )
}

export const useWalletConnectContext = () => useContext(WalletConnectContext)
