/*
Copyright 2018 - 2023 The Alephium Authors
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

import { ReactNode } from 'react'
import styled from 'styled-components'

interface InputsSectionProps {
  title: string
  HeaderActions?: ReactNode
  className?: string
}

const InputsSection: FC<InputsSectionProps> = ({ title, className, HeaderActions, children }) => (
  <div className={className}>
    <Header>
      <Title>{title}</Title>
      {HeaderActions}
    </Header>
    {children}
  </div>
)

export default InputsSection

const Title = styled.div`
  font-size: 15px;
  font-weight: var(--fontWeight-semiBold);
`

const Header = styled.div`
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
`
