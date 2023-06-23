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

import { Asset } from '@alephium/sdk'
import { motion } from 'framer-motion'
import styled, { useTheme } from 'styled-components'

import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import HashEllipsed from '@/components/HashEllipsed'
import TableCellAmount from '@/components/Table/TableCellAmount'

interface TokenListProps {
  tokens?: Asset[]
  limit?: number
  className?: string
}

const TokenList = ({ tokens, limit, className }: TokenListProps) => {
  const theme = useTheme()

  if (!tokens) return null

  const displayedTokens = limit ? tokens.slice(0, limit) : tokens

  return (
    <motion.div className={className}>
      {displayedTokens.map((token) => (
        <AssetRow key={token.id}>
          <AssetLogoStyled asset={token} size={30} />
          <NameColumn>
            <TokenName>{token.name || 'Unknown token'}</TokenName>
            <TokenSymbol>
              {token.symbol ?? (
                <UnknownTokenId>
                  <HashEllipsed hash={token.id} />
                </UnknownTokenId>
              )}
            </TokenSymbol>
          </NameColumn>
          <TableCellAmount>
            <TokenAmount
              value={token.balance}
              suffix={token.symbol}
              decimals={token.decimals}
              isUnknownToken={!token.symbol}
            />
            {token.lockedBalance > 0 ? (
              <TokenAmountSublabel>
                {'Available '}
                <Amount
                  value={token.balance - token.lockedBalance}
                  suffix={token.symbol}
                  color={theme.font.tertiary}
                  decimals={token.decimals}
                />
              </TokenAmountSublabel>
            ) : !token.name ? (
              <TokenAmountSublabel>Raw amount</TokenAmountSublabel>
            ) : undefined}
          </TableCellAmount>
        </AssetRow>
      ))}
    </motion.div>
  )
}

export default TokenList

const AssetRow = styled.div`
  display: flex;
  padding: 15px 20px;
  align-items: center;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const AssetLogoStyled = styled(AssetLogo)`
  margin-right: 20px;
`

const TokenName = styled.span`
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TokenSymbol = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  max-width: 150px;
`

const TokenAmount = styled(Amount)`
  font-size: 14px;
`

const TokenAmountSublabel = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 11px;
`

const NameColumn = styled(Column)`
  margin-right: 50px;
`

const UnknownTokenId = styled.div`
  display: flex;
`
