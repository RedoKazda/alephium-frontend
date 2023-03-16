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

import { Check, Copy } from 'lucide-react'
import { MouseEvent, useEffect, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { useGlobalContext } from '@/contexts/global'

interface ClipboardButtonProps {
  textToCopy: string
  tooltip?: string
  className?: string
}

const ClipboardButton = ({ textToCopy, tooltip, className }: ClipboardButtonProps) => {
  const [hasBeenCopied, setHasBeenCopied] = useState(false)
  const { setSnackbarMessage } = useGlobalContext()

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    navigator.clipboard
      .writeText(textToCopy)
      .catch((e) => {
        throw e
      })
      .then(() => {
        setHasBeenCopied(true)
      })
  }

  useEffect(() => {
    // Reset icon after copy
    let interval: ReturnType<typeof setInterval>

    if (hasBeenCopied) {
      ReactTooltip.rebuild()
      setSnackbarMessage({ text: 'Copied to clipboard!', type: 'info' })

      interval = setInterval(() => {
        setHasBeenCopied(false)
      }, 3000)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [hasBeenCopied, setSnackbarMessage])

  if (!hasBeenCopied) {
    return (
      <StyledClipboardIcon
        size={15}
        data-tip={tooltip || 'Copy to clipboard'}
        onClick={handleClick}
        className={className}
      />
    )
  } else {
    return <StyledCheckIcon size={15} className={className} />
  }
}

export default ClipboardButton

const StyledClipboardIcon = styled(Copy)`
  display: inline;
  margin-left: 10px;
  cursor: pointer;
  stroke: currentColor;
`

const StyledCheckIcon = styled(Check)`
  margin-left: 10px;
  color: ${({ theme }) => theme.global.valid};
`
