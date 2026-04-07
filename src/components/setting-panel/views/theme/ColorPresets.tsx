import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  Box,
  HStack,
  IconButton,
  Slider,
  Text,
  VStack,
} from '@chakra-ui/react'
import {
  HiOutlineInformationCircle,
} from 'react-icons/hi'
import {
  hexToRgb,
  isValidHexColor,
  normalizeHexColor,
} from '@/entrypoints/content/gemini-theme'
import { Tooltip } from '@/components/ui/tooltip'
import { tt } from '@/utils/i18n'

interface ColorPresetsProps {
  customColor: string
  surfaceOpacity: number
  onApplyCustomTheme: (settings: { color?: string; surfaceOpacity?: number }) => Promise<void>
  isLoading?: boolean
}

interface HsvColor {
  h: number
  s: number
  v: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`
}

function hsvToRgb({ h, s, v }: HsvColor): { r: number; g: number; b: number } {
  const hue = ((h % 360) + 360) % 360
  const chroma = v * s
  const segment = hue / 60
  const x = chroma * (1 - Math.abs((segment % 2) - 1))
  const match = v - chroma

  let red = 0
  let green = 0
  let blue = 0

  if (segment >= 0 && segment < 1) {
    red = chroma
    green = x
  } else if (segment < 2) {
    red = x
    green = chroma
  } else if (segment < 3) {
    green = chroma
    blue = x
  } else if (segment < 4) {
    green = x
    blue = chroma
  } else if (segment < 5) {
    red = x
    blue = chroma
  } else {
    red = chroma
    blue = x
  }

  return {
    r: (red + match) * 255,
    g: (green + match) * 255,
    b: (blue + match) * 255,
  }
}

function hexToHsv(value: string): HsvColor {
  const { r, g, b } = hexToRgb(value)
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min

  let hue = 0
  if (delta !== 0) {
    if (max === red) {
      hue = 60 * (((green - blue) / delta) % 6)
    } else if (max === green) {
      hue = 60 * (((blue - red) / delta) + 2)
    } else {
      hue = 60 * (((red - green) / delta) + 4)
    }
  }

  return {
    h: hue < 0 ? hue + 360 : hue,
    s: max === 0 ? 0 : delta / max,
    v: max,
  }
}

function hsvToHex(value: HsvColor): string {
  const { r, g, b } = hsvToRgb(value)
  return rgbToHex(r, g, b)
}

export function ColorPresets({
  customColor,
  surfaceOpacity,
  onApplyCustomTheme,
  isLoading,
}: ColorPresetsProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const nativeColorInputRef = useRef<HTMLInputElement | null>(null)
  const [hexValue, setHexValue] = useState(customColor)
  const [localOpacity, setLocalOpacity] = useState(surfaceOpacity)
  const [pickerColor, setPickerColor] = useState<HsvColor>(() => hexToHsv(customColor))
  const [isDraggingPanel, setIsDraggingPanel] = useState(false)
  const previewHex = isValidHexColor(hexValue) ? normalizeHexColor(hexValue) : customColor
  const hueColor = hsvToHex({ h: pickerColor.h, s: 1, v: 1 })

  useEffect(() => {
    setHexValue(customColor)
    setPickerColor(hexToHsv(customColor))
  }, [customColor])

  useEffect(() => {
    setLocalOpacity(surfaceOpacity)
  }, [surfaceOpacity])

  const updateLocalColor = (nextColor: HsvColor) => {
    setPickerColor(nextColor)
    setHexValue(hsvToHex(nextColor))
  }

  const commitColor = async (value: string) => {
    const normalized = normalizeHexColor(value)
    setHexValue(normalized)
    setPickerColor(hexToHsv(normalized))
    await onApplyCustomTheme({ color: normalized })
  }

  const readPanelColor = (clientX: number, clientY: number): HsvColor | null => {
    const panel = panelRef.current
    if (!panel) return null

    const rect = panel.getBoundingClientRect()
    const saturation = clamp((clientX - rect.left) / rect.width, 0, 1)
    const value = clamp(1 - ((clientY - rect.top) / rect.height), 0, 1)

    return {
      h: pickerColor.h,
      s: saturation,
      v: value,
    }
  }

  const handlePanelPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isLoading) return
    const nextColor = readPanelColor(event.clientX, event.clientY)
    if (!nextColor) return

    setIsDraggingPanel(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    updateLocalColor(nextColor)
  }

  const handlePanelPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingPanel || isLoading) return
    const nextColor = readPanelColor(event.clientX, event.clientY)
    if (!nextColor) return
    updateLocalColor(nextColor)
  }

  const handlePanelPointerUp = async (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingPanel) return
    const nextColor = readPanelColor(event.clientX, event.clientY)
    setIsDraggingPanel(false)
    event.currentTarget.releasePointerCapture(event.pointerId)

    if (!nextColor) return
    const nextHex = hsvToHex(nextColor)
    updateLocalColor(nextColor)
    await onApplyCustomTheme({ color: nextHex })
  }

  const handleApplyHex = async () => {
    if (!isValidHexColor(hexValue)) {
      setHexValue(customColor)
      return
    }

    await commitColor(hexValue)
  }

  return (
    <Box mb={5} overflow="visible">
      <Box
        width="100%"
        p={4}
        borderRadius="xl"
        bg="color-mix(in srgb, var(--gem-sys-color--surface-container) 72%, transparent)"
        border="1px solid"
        borderColor="border.muted"
        boxShadow="0 14px 40px rgba(15, 23, 42, 0.08)"
      >
        <VStack align="stretch" gap={4}>
          <Box
            pt={1}
          >
            <VStack align="stretch" gap={4}>
              <HStack
                align={{ base: 'stretch', md: 'flex-start' }}
                gap={4}
                flexDirection={{ base: 'column', md: 'row' }}
              >
                <Box
                  ref={panelRef}
                  position="relative"
                  width={{ base: '100%', md: '220px' }}
                  height="164px"
                  borderRadius="xl"
                  overflow="hidden"
                  cursor={isLoading ? 'not-allowed' : 'crosshair'}
                  border="1px solid"
                  borderColor="var(--gpk-panel-accent-border)"
                  bg={`linear-gradient(to top, #000000, transparent), linear-gradient(to right, #ffffff, ${hueColor})`}
                  onPointerDown={handlePanelPointerDown}
                  onPointerMove={handlePanelPointerMove}
                  onPointerUp={(event) => void handlePanelPointerUp(event)}
                  onPointerCancel={() => setIsDraggingPanel(false)}
                  style={{ touchAction: 'none' }}
                >
                  <Box
                    position="absolute"
                    left={`${pickerColor.s * 100}%`}
                    top={`${(1 - pickerColor.v) * 100}%`}
                    transform="translate(-50%, -50%)"
                    width="18px"
                    height="18px"
                    borderRadius="full"
                    border="2px solid rgba(255,255,255,0.92)"
                    boxShadow="0 0 0 1px rgba(15, 23, 42, 0.16), 0 8px 18px rgba(15, 23, 42, 0.18)"
                    bg="transparent"
                    pointerEvents="none"
                  />
                </Box>

                <VStack flex="1" align="stretch" gap={3}>
                  <HStack gap={3} align="center">
                    <button
                      aria-label={tt('settingPanel.theme.customColorPick', 'Accent color')}
                      onClick={() => {
                        if (!isLoading) {
                          nativeColorInputRef.current?.click()
                        }
                      }}
                      disabled={isLoading}
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '16px',
                        border: '1px solid var(--gpk-panel-accent-border)',
                        background: previewHex,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        flexShrink: 0,
                      }}
                    />
                    <input
                      ref={nativeColorInputRef}
                      type="color"
                      value={normalizeHexColor(hexValue)}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        const nextValue = normalizeHexColor(event.target.value)
                        setHexValue(nextValue)
                        setPickerColor(hexToHsv(nextValue))
                        void onApplyCustomTheme({ color: nextValue })
                      }}
                      style={{ display: 'none' }}
                    />

                    <input
                      aria-label={tt('settingPanel.theme.customColorHex', 'Hex color')}
                      type="text"
                      value={hexValue}
                      maxLength={7}
                      placeholder="#4285f4"
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setHexValue(event.target.value)
                      }}
                      onBlur={() => void handleApplyHex()}
                      onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          void handleApplyHex()
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '14px',
                        border: `1px solid ${isValidHexColor(hexValue) ? 'var(--gpk-panel-accent-border)' : 'rgba(239, 68, 68, 0.45)'}`,
                        background: 'rgba(255, 255, 255, 0.56)',
                        color: 'var(--gem-sys-color--on-surface)',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      }}
                    />
                  </HStack>

                  <Box>
                    <HStack justify="space-between" align="center" mb={2}>
                      <Text fontSize="xs" color="gemOnSurfaceVariant">
                        {tt('settingPanel.theme.hue', 'Hue')}
                      </Text>
                      <Text fontSize="xs" color="gemOnSurfaceVariant">
                        {hexValue}
                      </Text>
                    </HStack>
                    <Slider.Root
                      min={0}
                      max={360}
                      step={1}
                      value={[pickerColor.h]}
                      onValueChange={(details) => {
                        const nextHue = details.value[0] ?? pickerColor.h
                        updateLocalColor({
                          ...pickerColor,
                          h: nextHue,
                        })
                      }}
                      onValueChangeEnd={(details) => {
                        const nextHue = details.value[0] ?? pickerColor.h
                        const nextColor = {
                          ...pickerColor,
                          h: nextHue,
                        }
                        updateLocalColor(nextColor)
                        void onApplyCustomTheme({ color: hsvToHex(nextColor) })
                      }}
                    >
                      <Slider.Control>
                        <Slider.Track bg="linear-gradient(90deg, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)">
                          <Slider.Range bg="transparent" />
                        </Slider.Track>
                        <Slider.Thumb index={0} boxShadow="0 0 0 4px var(--gpk-panel-accent-soft)">
                          <Slider.HiddenInput />
                        </Slider.Thumb>
                      </Slider.Control>
                    </Slider.Root>
                  </Box>
                </VStack>
              </HStack>
            </VStack>
          </Box>

          <Box
            pt={4}
            borderTop="1px solid"
            borderColor="var(--gpk-panel-accent-border)"
          >
            <HStack justify="space-between" align="center" mb={3}>
              <HStack gap={1.5}>
                <Text fontSize="sm" color="gemOnSurface">
                  {tt('settingPanel.theme.surfaceOpacity', 'Interface opacity')}
                </Text>
                <Tooltip
                  content={tt(
                    'settingPanel.theme.surfaceOpacityInfo',
                    'Controls transparency for themed panels and containers.',
                  )}
                >
                  <IconButton
                    aria-label={tt('settingPanel.theme.surfaceOpacity', 'Interface opacity')}
                    size="2xs"
                    variant="ghost"
                  >
                    <HiOutlineInformationCircle />
                  </IconButton>
                </Tooltip>
              </HStack>
              <Text fontSize="xs" color="gemOnSurfaceVariant">
                {localOpacity}%
              </Text>
            </HStack>
            <Slider.Root
              min={35}
              max={100}
              step={1}
              value={[localOpacity]}
              onValueChange={(details) => setLocalOpacity(details.value[0] ?? surfaceOpacity)}
              onValueChangeEnd={(details) => void onApplyCustomTheme({ surfaceOpacity: details.value[0] ?? surfaceOpacity })}
            >
              <Slider.Control>
                <Slider.Track bg="rgba(148, 163, 184, 0.2)">
                  <Slider.Range bg="var(--gpk-panel-accent)" />
                </Slider.Track>
                <Slider.Thumb index={0} boxShadow="0 0 0 4px var(--gpk-panel-accent-soft)">
                  <Slider.HiddenInput />
                </Slider.Thumb>
              </Slider.Control>
            </Slider.Root>
          </Box>
        </VStack>
      </Box>
    </Box>
  )
}
