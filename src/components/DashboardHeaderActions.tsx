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

import { isAddressValid } from '@alephium/sdk'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { usePostHog } from 'posthog-react-native'
import { memo, useState } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { Portal } from 'react-native-portalize'
import Toast from 'react-native-root-toast'
import styled from 'styled-components/native'

import Button from '~/components/buttons/Button'
import BottomModal from '~/components/layout/BottomModal'
import QRCodeScannerModal from '~/components/QRCodeScannerModal'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import WalletConnectPairingsModal from '~/screens/WalletConnectPairingsModal'
import { cameraToggled } from '~/store/appSlice'

interface DashboardHeaderActionsProps {
  style?: StyleProp<ViewStyle>
}

const DashboardHeaderActions = ({ style }: DashboardHeaderActionsProps) => {
  const isMnemonicBackedUp = useAppSelector((s) => s.activeWallet.isMnemonicBackedUp)
  const networkStatus = useAppSelector((s) => s.network.status)
  const navigation = useNavigation<NavigationProp<SendNavigationParamList>>()
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const dispatch = useAppDispatch()
  const posthog = usePostHog()
  const { pairWithDapp, walletConnectClient, activeSessions } = useWalletConnectContext()

  const [isWalletConnectPairingsModalOpen, setIsWalletConnectPairingsModalOpen] = useState(false)

  const openQRCodeScannerModal = () => dispatch(cameraToggled(true))
  const closeQRCodeScannerModal = () => dispatch(cameraToggled(false))

  const showOfflineMessage = () =>
    Toast.show('The app is offline and trying to reconnect. Please, check your network settings.')

  const handleQRCodeScan = async (text: string) => {
    if (isAddressValid(text)) {
      navigation.navigate('SendNavigation', { screen: 'OriginScreen', params: { toAddressHash: text } })
      posthog?.capture('Send: Captured destination address by scanning QR code from Dashboard')
    } else if (text.startsWith('wc:')) {
      pairWithDapp(text)
    }
  }

  return (
    <>
      <View style={style}>
        {networkStatus === 'offline' && (
          <Button onPress={showOfflineMessage} iconProps={{ name: 'cloud-offline-outline' }} variant="alert" round />
        )}
        <Button
          onPress={() => navigation.navigate('SecurityScreen')}
          iconProps={{ name: 'warning-outline' }}
          variant={isMnemonicBackedUp ? 'default' : 'alert'}
          round
        />
        {walletConnectClient && activeSessions.length > 0 && (
          <Button onPress={() => setIsWalletConnectPairingsModalOpen(true)} iconProps={{ name: 'radio' }} round />
        )}
        <Button onPress={openQRCodeScannerModal} iconProps={{ name: 'scan-outline' }} round />
        <Button onPress={() => navigation.navigate('SettingsScreen')} iconProps={{ name: 'settings-outline' }} round />
      </View>
      {isCameraOpen && (
        <QRCodeScannerModal
          onClose={closeQRCodeScannerModal}
          onQRCodeScan={handleQRCodeScan}
          text="Scan an Alephium address QR code to send funds or a WalletConnect QR code to connect to a dApp."
        />
      )}

      <Portal>
        <BottomModal
          Content={WalletConnectPairingsModal}
          isOpen={isWalletConnectPairingsModalOpen}
          onClose={() => setIsWalletConnectPairingsModalOpen(false)}
        />
      </Portal>
    </>
  )
}

export default memo(styled(DashboardHeaderActions)`
  flex-direction: row;
  align-items: center;
  gap: 15px;
`)
