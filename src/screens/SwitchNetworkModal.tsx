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

import { capitalize } from 'lodash'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated'
import styled from 'styled-components/native'

import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import BoxSurface from '~/components/layout/BoxSurface'
import { ModalContent, ModalContentProps } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import RadioButtonRow from '~/components/RadioButtonRow'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { networkPresetSettings, persistSettings } from '~/persistent-storage/settings'
import { customNetworkSettingsSaved, networkPresetSwitched } from '~/store/networkSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { NetworkName, NetworkPreset } from '~/types/network'
import { NetworkSettings } from '~/types/settings'

const networkNames = Object.values(NetworkName)

const SwitchNetworkModal = ({ onClose, ...props }: ModalContentProps) => {
  const currentNetworkName = useAppSelector((s) => s.network.name)
  const currentNetworkSettings = useAppSelector((s) => s.network.settings)
  const { control, handleSubmit } = useForm<NetworkSettings>({
    defaultValues: currentNetworkSettings
  })
  const dispatch = useAppDispatch()

  const [showCustomNetworkForm, setShowCustomNetworkForm] = useState(currentNetworkName === NetworkName.custom)
  const [selectedNetworkName, setSelectedNetworkName] = useState(currentNetworkName)

  const handleNetworkItemPress = async (newNetworkName: NetworkPreset | NetworkName.custom) => {
    setSelectedNetworkName(newNetworkName)

    if (newNetworkName === NetworkName.custom) {
      setShowCustomNetworkForm(true)
    } else {
      await persistSettings('network', networkPresetSettings[newNetworkName])
      dispatch(networkPresetSwitched(newNetworkName))

      if (showCustomNetworkForm) setShowCustomNetworkForm(false)
    }
  }

  const saveCustomNetwork = async (formData: NetworkSettings) => {
    await persistSettings('network', formData)
    dispatch(customNetworkSettingsSaved(formData))

    onClose && onClose()
  }

  return (
    <ModalContent verticalGap {...props}>
      <ScreenSection>
        <BottomModalScreenTitle>Current network</BottomModalScreenTitle>
      </ScreenSection>
      <View>
        <BoxSurface>
          {networkNames.map((networkName) => (
            <RadioButtonRow
              key={networkName}
              title={capitalize(networkName)}
              onPress={() => handleNetworkItemPress(networkName)}
              isActive={networkName === selectedNetworkName}
            />
          ))}
        </BoxSurface>

        {showCustomNetworkForm && (
          <CustomNetworkFormContainer entering={FadeInDown} exiting={FadeOutDown}>
            <ScreenSection verticalGap>
              <Controller
                name="nodeHost"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Node host"
                    keyboardType="url"
                    textContentType="URL"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
                control={control}
              />
              <Controller
                name="explorerApiHost"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Explorer API host"
                    keyboardType="url"
                    textContentType="URL"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
                control={control}
              />
              <Controller
                name="explorerUrl"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Explorer URL"
                    keyboardType="url"
                    textContentType="URL"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
                control={control}
              />

              <ButtonStyled centered title="Save custom network" onPress={handleSubmit(saveCustomNetwork)} />
            </ScreenSection>
          </CustomNetworkFormContainer>
        )}
      </View>
    </ModalContent>
  )
}

export default SwitchNetworkModal

const ButtonStyled = styled(Button)`
  margin-bottom: 20px;
`

const CustomNetworkFormContainer = styled(Animated.View)`
  margin-top: ${DEFAULT_MARGIN}px;
`
