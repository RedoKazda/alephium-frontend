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

import { StackScreenProps } from '@react-navigation/stack'
import { ListIcon, PlusIcon } from 'lucide-react-native'
import { usePostHog } from 'posthog-react-native'
import { useEffect, useState } from 'react'
import { RefreshControl, View } from 'react-native'
import { useModalize } from 'react-native-modalize'
import { Portal } from 'react-native-portalize'
import styled, { css, useTheme } from 'styled-components/native'

import AddressBox from '~/components/AddressBox'
import AddressCard from '~/components/AddressCard'
import AddressesTokensList from '~/components/AddressesTokensList'
import Button from '~/components/buttons/Button'
import Carousel from '~/components/Carousel'
import BaseHeader from '~/components/headers/BaseHeader'
import ScrollScreen from '~/components/layout/BottomBarScrollScreen'
import Modalize from '~/components/layout/Modalize'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import TopTabBar from '~/components/TopTabBar'
import useCustomHeader from '~/hooks/layout/useCustomHeader'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { AddressTabsParamList } from '~/navigation/AddressesTabNavigation'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import EditAddressModal from '~/screens/Address/EditAddressModal'
import {
  selectAddressByHash,
  selectAddressIds,
  selectAllAddresses,
  selectDefaultAddress,
  syncAddressesData
} from '~/store/addressesSlice'
import { AddressHash } from '~/types/addresses'
import { useScroll } from '~/utils/scroll'

type ScreenProps = StackScreenProps<AddressTabsParamList, 'AddressesScreen'> &
  StackScreenProps<SendNavigationParamList, 'AddressesScreen'>

interface AddressesScreenProps extends ScreenProps, ScrollScreenProps {}

const AddressesScreen = ({ navigation, route: { params }, ...props }: AddressesScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const { handleScroll, scrollY } = useScroll()
  const posthog = usePostHog()

  const isLoading = useAppSelector((s) => s.addresses.syncingAddressData)
  const addresses = useAppSelector(selectAllAddresses)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const [selectedAddressHash, setSelectedAddressHash] = useState(defaultAddress?.hash ?? '')
  const selectedAddress = useAppSelector((s) => selectAddressByHash(s, selectedAddressHash))

  const {
    ref: addressQuickSelectionModalRef,
    open: openAddressQuickSelectionModal,
    close: closeAddressQuickSelectionModal
  } = useModalize()
  const {
    ref: addressSettingsModalRef,
    open: openAddressSettingsModal,
    close: closeAddressSettingsModal
  } = useModalize()

  const [heightCarouselItem, setHeightCarouselItem] = useState(200)
  const [scrollToCarouselPage, setScrollToCarouselPage] = useState<number>()

  useCustomHeader({
    Header: (props) => <BaseHeader scrollY={scrollY} HeaderLeft={<TopTabBar {...props} />} />,
    navigation,
    setInParent: true
  })

  useEffect(() => {
    if (defaultAddress) {
      setSelectedAddressHash(defaultAddress.hash)
    }
  }, [defaultAddress])

  const onAddressCardsScrollEnd = (index: number) => {
    if (index < addressHashes.length) setSelectedAddressHash(addressHashes[index])
  }

  const renderAddressCard = ({ item }: { item: string }) => (
    <View onLayout={(event) => setHeightCarouselItem(event.nativeEvent.layout.height)} key={item}>
      <AddressCard addressHash={item} onSettingsPress={openAddressSettingsModal} />
    </View>
  )

  const refreshData = () => {
    if (!isLoading) dispatch(syncAddressesData(addressHashes))
  }

  if (!selectedAddress) return null

  return (
    <>
      <ScrollScreen
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} />}
        onScroll={handleScroll}
        bounces={false}
        hasHeader
        hasBottomBar
        {...props}
      >
        <ScreenContent>
          <Carousel
            data={addressHashes}
            renderItem={renderAddressCard}
            onScrollEnd={onAddressCardsScrollEnd}
            padding={30}
            distance={20}
            height={heightCarouselItem}
            scrollTo={scrollToCarouselPage}
            FooterComponent={
              <>
                {addresses.length > 2 && (
                  <Button onPress={() => openAddressQuickSelectionModal()} Icon={ListIcon} type="transparent" />
                )}
                <Button
                  onPress={() => navigation.navigate('NewAddressScreen')}
                  Icon={PlusIcon}
                  title="New address"
                  color={theme.global.accent}
                  compact
                />
              </>
            }
          />
          {selectedAddress && <AddressesTokensList addressHash={selectedAddress.hash} style={{ paddingBottom: 50 }} />}
        </ScreenContent>
      </ScrollScreen>

      <Portal>
        <Modalize
          ref={addressQuickSelectionModalRef}
          flatListProps={{
            data: addresses,
            keyExtractor: (item) => item.hash,
            renderItem: ({ item: address, index }) => (
              <AddressBoxStyled
                key={address.hash}
                addressHash={address.hash}
                isFirst={index === 0}
                isLast={index === addresses.length - 1}
                onPress={() => {
                  setSelectedAddressHash(address.hash)
                  setScrollToCarouselPage(addressHashes.findIndex((hash) => hash === address.hash))
                  closeAddressQuickSelectionModal()
                  posthog?.capture('Used address quick navigation')
                }}
              />
            )
          }}
        />
        <Modalize ref={addressSettingsModalRef}>
          {selectedAddress && (
            <EditAddressModal addressHash={selectedAddress.hash} onClose={closeAddressSettingsModal} />
          )}
        </Modalize>
      </Portal>
    </>
  )
}

export default AddressesScreen

const ScreenContent = styled.View`
  padding-top: 15px;
`

const AddressBoxStyled = styled(AddressBox)`
  margin: 10px 20px;

  ${({ isFirst }) =>
    isFirst &&
    css`
      margin-top: 20px;
    `}

  ${({ isLast }) =>
    isLast &&
    css`
      margin-bottom: 40px;
    `}
`
