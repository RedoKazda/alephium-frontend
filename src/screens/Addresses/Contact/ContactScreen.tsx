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
import { colord } from 'colord'
import { Clipboard, LucideProps, Share2Icon, Upload } from 'lucide-react-native'
import { useEffect } from 'react'
import { PressableProps, StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import { AddressTabsParamList } from '~/navigation/AddressesTabNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { themes } from '~/style/themes'
import { copyAddressToClipboard } from '~/utils/addresses'
import { stringToColour } from '~/utils/colors'

interface ScreenProps extends StackScreenProps<AddressTabsParamList & RootStackParamList, 'ContactScreen'> {
  style?: StyleProp<ViewStyle>
}

const contact = { id: '2', name: 'Mary Poppins', address: '125orKZtvWeoWqbrHy7vHZQvpLfAaGkU5Tn91KzZqQzot' }

const ContactScreen = ({ navigation, route: { params }, style }: ScreenProps) => {
  const iconBgColor = stringToColour(contact.address)
  const textColor = themes[colord(iconBgColor).isDark() ? 'dark' : 'light'].font.primary

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title="Edit"
          onPress={() => console.log('navigate to edit screen')}
          type="transparent"
          variant="accent"
        />
      )
    })
  }, [navigation])

  return (
    <ScrollScreen style={style}>
      <CenteredSection>
        <ContactIcon color={iconBgColor}>
          <AppText semiBold size={32} color={textColor}>
            {contact.name[0].toUpperCase()}
          </AppText>
        </ContactIcon>
        <ContactName semiBold size={28}>
          {contact.name}
        </ContactName>
        <ContactAddress medium size={16} color="secondary" numberOfLines={1} ellipsizeMode="middle">
          {contact.address}
        </ContactAddress>
        <ButtonsRow>
          <ContactButton
            Icon={Upload}
            title={'Send funds'}
            onPress={() => navigation.navigate('SendNavigation', { toAddressHash: contact.address })}
          />
          <ContactButton
            Icon={Clipboard}
            title="Copy address"
            onPress={() => copyAddressToClipboard(contact.address)}
          />
          <ContactButton Icon={Share2Icon} title="Share" />
        </ButtonsRow>
      </CenteredSection>
    </ScrollScreen>
  )
}

export default ContactScreen

const CenteredSection = styled(ScreenSection)`
  align-items: center;
`

// TODO: DRY
const ContactIcon = styled.View<{ color?: string }>`
  justify-content: center;
  align-items: center;
  width: 95px;
  height: 95px;
  border-radius: 95px;
  background-color: ${({ color, theme }) => color || theme.font.primary};
`

const ContactName = styled(AppText)`
  margin-top: 30px;
`

const ContactAddress = styled(AppText)`
  margin-top: 15px;
  max-width: 140px;
`

const ButtonsRow = styled.View`
  flex-direction: row;
  gap: 16px;
  justify-content: space-between;
  width: 100%;
  margin-top: 40px;
`

// TODO: Move to new cleaned-up Buttons component
interface ButtonProps extends PressableProps {
  title: string
  Icon?: (props: LucideProps) => JSX.Element
}

const ContactButton = ({ Icon, title, children, ...props }: ButtonProps) => {
  const theme = useTheme()

  return (
    <ButtonStyled {...props}>
      {Icon && <Icon size={20} color={theme.global.accent} />}
      <ButtonText medium color="accent">
        {title}
      </ButtonText>
    </ButtonStyled>
  )
}

const ButtonStyled = styled.Pressable`
  padding: 12px 6px;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: 9px;
  justify-content: center;
  align-items: center;
  gap: 5px;
  flex: 1;
`

const ButtonText = styled(AppText)`
  text-align: center;
`
