import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  Box,
  Button,
  HStack,
  Slider,
  Text,
  VStack,
} from '@chakra-ui/react'
import {
  hexToRgb,
  isValidHexColor,
  normalizeHexColor,
  normalizeSurfaceOpacity,
  type CustomThemeSettings,
} from '@/entrypoints/content/gemini-theme'
import type { CustomThemeApplyOptions } from '@/entrypoints/content/site-adapters/types'
import { tt } from '@/utils/i18n'

interface ColorPresetsProps {
  accentColor: string
  surfaceColor: string
  surfaceOpacity: number
  textColor: string
  showSurfaceOpacityControl?: boolean
  onApplyCustomTheme: (
    settings: Partial<CustomThemeSettings>,
    options?: CustomThemeApplyOptions,
  ) => Promise<void>
  isLoading?: boolean
}

interface HsvColor {
  h: number
  s: number
  v: number
}

type ColorField = 'accentColor' | 'surfaceColor' | 'textColor'

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

const FIELD_META: Record<
  ColorField,
  { labelKey: string; fallback: string; hexKey: string; hexFallback: string }
> = {
  accentColor: {
    labelKey: 'settingPanel.theme.customColorPick',
    fallback: 'Interface accent',
    hexKey: 'settingPanel.theme.customColorHex',
    hexFallback: 'Interface accent hex',
  },
  surfaceColor: {
    labelKey: 'settingPanel.theme.surfaceColorPick',
    fallback: 'Chat surface',
    hexKey: 'settingPanel.theme.surfaceColorHex',
    hexFallback: 'Surface hex',
  },
  textColor: {
    labelKey: 'settingPanel.theme.textColorPick',
    fallback: 'Chat text',
    hexKey: 'settingPanel.theme.textColorHex',
    hexFallback: 'Text hex',
  },
}

export function ColorPresets({
  accentColor,
  surfaceColor,
  surfaceOpacity,
  textColor,
  showSurfaceOpacityControl,
  onApplyCustomTheme,
  isLoading,
}: ColorPresetsProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const nativeColorInputRef = useRef<HTMLInputElement | null>(null)
  const isAdjustingSurfaceOpacityRef = useRef(false)
  const [activeField, setActiveField] = useState<ColorField>('accentColor')
  const [draftColors, setDraftColors] = useState<Record<ColorField, string>>({
    accentColor,
    surfaceColor,
    textColor,
  })
  const [draftSurfaceOpacity, setDraftSurfaceOpacity] = useState(surfaceOpacity)
  const [pickerColor, setPickerColor] = useState<HsvColor>(() => hexToHsv(accentColor))
  const [isDraggingPanel, setIsDraggingPanel] = useState(false)

  const currentColor = draftColors[activeField]
  const previewHex = isValidHexColor(currentColor)
    ? normalizeHexColor(currentColor)
    : currentColor
  const hueColor = hsvToHex({ h: pickerColor.h, s: 1, v: 1 })

  useEffect(() => {
    setDraftColors({
      accentColor,
      surfaceColor,
      textColor,
    })
  }, [accentColor, surfaceColor, textColor])

  useEffect(() => {
    if (isAdjustingSurfaceOpacityRef.current) return
    setDraftSurfaceOpacity(surfaceOpacity)
  }, [surfaceOpacity])

  useEffect(() => {
    setPickerColor(hexToHsv(draftColors[activeField]))
  }, [activeField, draftColors])

  const fieldOptions = useMemo(
    () => (Object.entries(FIELD_META) as Array<[ColorField, typeof FIELD_META[ColorField]]>),
    [],
  )

  const updateDraftColor = (field: ColorField, value: string) => {
    setDraftColors((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const commitColor = async (field: ColorField, value: string) => {
    const normalized = normalizeHexColor(value)
    updateDraftColor(field, normalized)
    setPickerColor(hexToHsv(normalized))
    await onApplyCustomTheme({ [field]: normalized })
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
    const nextHex = hsvToHex(nextColor)
    setPickerColor(nextColor)
    updateDraftColor(activeField, nextHex)
  }

  const handlePanelPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingPanel || isLoading) return
    const nextColor = readPanelColor(event.clientX, event.clientY)
    if (!nextColor) return

    const nextHex = hsvToHex(nextColor)
    setPickerColor(nextColor)
    updateDraftColor(activeField, nextHex)
  }

  const handlePanelPointerUp = async (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingPanel) return
    const nextColor = readPanelColor(event.clientX, event.clientY)
    setIsDraggingPanel(false)
    event.currentTarget.releasePointerCapture(event.pointerId)

    if (!nextColor) return
    const nextHex = hsvToHex(nextColor)
    setPickerColor(nextColor)
    updateDraftColor(activeField, nextHex)
    await onApplyCustomTheme({ [activeField]: nextHex })
  }

  const handleApplyHex = async () => {
    if (!isValidHexColor(currentColor)) {
      updateDraftColor(activeField, activeField === 'accentColor'
        ? accentColor
        : activeField === 'surfaceColor'
          ? surfaceColor
          : textColor)
      return
    }

    await commitColor(activeField, currentColor)
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
          <HStack gap={2} flexWrap="wrap">
            {fieldOptions.map(([field, meta]) => {
              const isActive = activeField === field
              const swatch = draftColors[field]
              return (
                <Button
                  key={field}
                  size="sm"
                  variant={isActive ? 'solid' : 'outline'}
                  onClick={() => setActiveField(field)}
                  disabled={isLoading}
                  borderRadius="full"
                  px={3}
                  bg={isActive ? 'var(--gpk-panel-accent)' : 'rgba(255,255,255,0.56)'}
                  color={isActive ? 'var(--gpk-panel-accent-contrast)' : 'gemOnSurface'}
                >
                  <HStack gap={2}>
                    <Box
                      width="10px"
                      height="10px"
                      borderRadius="full"
                      bg={swatch}
                      border="1px solid rgba(15, 23, 42, 0.12)"
                    />
                    <Box as="span">{tt(meta.labelKey, meta.fallback)}</Box>
                  </HStack>
                </Button>
              )
            })}
          </HStack>

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
                  aria-label={tt(FIELD_META[activeField].labelKey, FIELD_META[activeField].fallback)}
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
                  value={normalizeHexColor(currentColor)}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const nextValue = normalizeHexColor(event.target.value)
                    updateDraftColor(activeField, nextValue)
                    setPickerColor(hexToHsv(nextValue))
                    void onApplyCustomTheme({ [activeField]: nextValue })
                  }}
                  style={{ display: 'none' }}
                />

                <input
                  aria-label={tt(FIELD_META[activeField].hexKey, FIELD_META[activeField].hexFallback)}
                  type="text"
                  value={currentColor}
                  maxLength={7}
                  placeholder="#4285f4"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    updateDraftColor(activeField, event.target.value)
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
                    border: `1px solid ${isValidHexColor(currentColor) ? 'var(--gpk-panel-accent-border)' : 'rgba(239, 68, 68, 0.45)'}`,
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
                    {currentColor}
                  </Text>
                </HStack>
                <Slider.Root
                  min={0}
                  max={360}
                  step={1}
                  value={[pickerColor.h]}
                  onValueChange={(details: { value: number[] }) => {
                    const nextHue = details.value[0] ?? pickerColor.h
                    const nextColor = {
                      ...pickerColor,
                      h: nextHue,
                    }
                    setPickerColor(nextColor)
                    updateDraftColor(activeField, hsvToHex(nextColor))
                  }}
                  onValueChangeEnd={(details: { value: number[] }) => {
                    const nextHue = details.value[0] ?? pickerColor.h
                    const nextColor = {
                      ...pickerColor,
                      h: nextHue,
                    }
                    setPickerColor(nextColor)
                    const nextHex = hsvToHex(nextColor)
                    updateDraftColor(activeField, nextHex)
                    void onApplyCustomTheme({ [activeField]: nextHex })
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

          {showSurfaceOpacityControl && (
            <Box
              p={4}
              borderRadius="xl"
              bg="rgba(255,255,255,0.44)"
              border="1px solid"
              borderColor="var(--gpk-panel-surface-border)"
            >
              <HStack justify="space-between" align="center" mb={2}>
                <Text fontSize="sm" fontWeight="semibold" color="gemOnSurface">
                  {tt('settingPanel.theme.surfaceOpacity', 'Chat surface opacity')}
                </Text>
                <Text fontSize="sm" color="gemOnSurfaceVariant">
                  {draftSurfaceOpacity}%
                </Text>
              </HStack>
              <Slider.Root
                min={35}
                max={100}
                step={1}
                value={[draftSurfaceOpacity]}
                  onValueChange={(details: { value: number[] }) => {
                    isAdjustingSurfaceOpacityRef.current = true
                    const nextOpacity = normalizeSurfaceOpacity(
                      Number(details.value[0] ?? surfaceOpacity),
                    )
                    setDraftSurfaceOpacity(nextOpacity)
                    void onApplyCustomTheme(
                      { surfaceOpacity: nextOpacity },
                      { persist: false },
                    )
                  }}
                onValueChangeEnd={(details: { value: number[] }) => {
                  const nextOpacity = normalizeSurfaceOpacity(
                    Number(details.value[0] ?? surfaceOpacity),
                  )
                  isAdjustingSurfaceOpacityRef.current = false
                  setDraftSurfaceOpacity(nextOpacity)
                  void onApplyCustomTheme({ surfaceOpacity: nextOpacity })
                }}
                disabled={isLoading}
              >
                <Slider.Control>
                  <Slider.Track bg="linear-gradient(90deg, rgba(15,23,42,0.12) 0%, var(--gpk-panel-surface-color) 100%)">
                    <Slider.Range bg="transparent" />
                  </Slider.Track>
                  <Slider.Thumb index={0} boxShadow="0 0 0 4px var(--gpk-panel-surface-soft)">
                    <Slider.HiddenInput />
                  </Slider.Thumb>
                </Slider.Control>
              </Slider.Root>
            </Box>
          )}

        </VStack>
      </Box>
    </Box>
  )
}
