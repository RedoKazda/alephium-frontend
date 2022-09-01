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

import { memo, useState } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import { labelColorPalette } from '../../utils/colors'
import AppText from '../AppText'
import HighlightRow from '../HighlightRow'
import ModalWithBackdrop from '../ModalWithBackdrop'

interface ColorPickerProps {
  onChange: (color: string) => void
  value?: string
  style?: StyleProp<ViewStyle>
}

const ColorPicker = ({ value, onChange, style }: ColorPickerProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleColorPress = (color: string) => {
    onChange(color)
    setIsModalVisible(false)
  }

  return (
    <>
      <HighlightRow isInput style={style} onPress={() => setIsModalVisible(!isModalVisible)}>
        <AppText>Color</AppText>
        <Dot color={value} />
      </HighlightRow>
      <ModalWithBackdrop animationType="fade" visible={isModalVisible} closeModal={() => setIsModalVisible(false)}>
        <Colors>
          {labelColorPalette.map((c) => (
            <Color key={c} color={c} onPress={() => handleColorPress(c)} />
          ))}
        </Colors>
      </ModalWithBackdrop>
    </>
  )
}

export default styled(ColorPicker)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const Dot = styled.View<{ color?: string }>`
  height: 15px;
  width: 15px;
  border-radius: 15px;
  background-color: ${({ color, theme }) => color ?? theme.font.primary};
`

const Colors = styled.View`
  width: 100%;
  height: 100%;
`

const Color = memo(styled(HighlightRow)<{ color: string }>`
  background-color: ${({ color }) => color};
  width: 100%;
  flex: 1;
`)
