import { Box, Heading, HStack, VStack } from '@chakra-ui/react'
import { useColorMode } from '@/components/ui/color-mode'
import {
  buildGeminiChatSurfaceTokens,
  DEFAULT_CUSTOM_THEME_SETTINGS,
  hexToRgbaString,
} from '@/entrypoints/content/gemini-theme'
import { t } from '@/utils/i18n'

interface LivePreviewProps {
  backgroundEnabled: boolean
  backgroundUrl: string | null
  blurPx: number
  sidebarScrimEnabled: boolean
  sidebarScrimIntensity: number
  messageGlassEnabled: boolean
  accentColor: string
  surfaceColor: string
  surfaceOpacity: number
  textColor: string
}

function PreviewAssistantIcon() {
  return (
    <Box w="16px" h="16px" flexShrink={0}>
      <svg viewBox="0 0 20 20" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2C5.03 2 1 5.58 1 10c0 1.94.78 3.72 2.08 5.15L2.4 18l3.24-1.31A10.2 10.2 0 0 0 10 18c4.97 0 9-3.58 9-8s-4.03-8-9-8Z" fill="url(#ccv-bubble-fill)" />
        <path d="M10 2C5.03 2 1 5.58 1 10c0 1.94.78 3.72 2.08 5.15L2.4 18l3.24-1.31A10.2 10.2 0 0 0 10 18c4.97 0 9-3.58 9-8s-4.03-8-9-8Z" stroke="rgba(15,23,42,0.2)" strokeWidth="1.2" />
        <circle cx="7" cy="10" r="1" fill="white" />
        <circle cx="10" cy="10" r="1" fill="white" />
        <circle cx="13" cy="10" r="1" fill="white" />
        <defs>
          <linearGradient id="ccv-bubble-fill" x1="3" y1="3" x2="17" y2="17" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60A5FA" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  )
}

export function LivePreview({
  backgroundEnabled,
  backgroundUrl,
  blurPx,
  sidebarScrimEnabled,
  sidebarScrimIntensity,
  messageGlassEnabled,
  accentColor,
  surfaceColor,
  surfaceOpacity,
  textColor,
}: LivePreviewProps) {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const canRenderBackground = backgroundEnabled && Boolean(backgroundUrl)
  const sidebarScrimAlpha = (Math.min(100, Math.max(0, sidebarScrimIntensity)) / 100)
    .toFixed(2)
  const previewTitle = t('settingPanel.theme.livePreview')
  const chromeSurfaceTokens = buildGeminiChatSurfaceTokens(
    surfaceColor,
    DEFAULT_CUSTOM_THEME_SETTINGS.surfaceOpacity,
  )
  const chatSurfaceTokens = buildGeminiChatSurfaceTokens(surfaceColor, surfaceOpacity)
  const surfaceBg = isDark
    ? chromeSurfaceTokens.darkSurfaceStrong
    : chromeSurfaceTokens.lightSurfaceStrong
  const surfaceBorder = hexToRgbaString(surfaceColor, isDark ? 0.34 : 0.28)
  const bubbleBg = isDark
    ? chatSurfaceTokens.darkSurface
    : chatSurfaceTokens.lightSurface
  const userBubbleBg = isDark
    ? chatSurfaceTokens.darkSurfaceStrong
    : chatSurfaceTokens.lightSurfaceStrong
  const composerBg = userBubbleBg
  const previewGlassEnabled = canRenderBackground && messageGlassEnabled

  return (
    <Box>
      <Heading size="sm" mb={3}>
        {previewTitle === 'settingPanel.theme.livePreview' ? 'Live Preview' : previewTitle}
      </Heading>

      <Box
        borderRadius="2xl"
        shadow="lg"
        overflow="hidden"
        border="1px solid"
        borderColor={surfaceBorder}
        position="relative"
        isolation="isolate"
      >
        {canRenderBackground && (
          <Box
            position="absolute"
            inset={0}
            overflow="hidden"
            borderRadius="inherit"
            pointerEvents="none"
            zIndex={0}
          >
            <Box
              position="absolute"
              inset={`-${Math.max(8, blurPx * 2)}px`}
              bgImage={`url(${backgroundUrl})`}
              bgSize="cover"
              bgPos="center"
              filter={`blur(${blurPx}px)${isDark ? ' brightness(0.5)' : ''}`}
            />
          </Box>
        )}

        <HStack
          align="stretch"
          minH={{ base: '340px', md: '380px' }}
          gap={0}
          position="relative"
          zIndex={1}
        >
          <VStack
            width="72px"
            p={3}
            gap={2}
            align="stretch"
            bg={canRenderBackground
              ? isDark
                ? hexToRgbaString(surfaceColor, 0.22)
                : 'rgba(246, 240, 224, 0.11)'
              : 'gemSidenavBg'}
            borderRight={backgroundEnabled ? 'none' : '1px solid'}
            borderColor={surfaceBorder}
            backdropFilter={canRenderBackground ? 'blur(12px)' : undefined}
            borderTopLeftRadius="2xl"
            borderBottomLeftRadius="2xl"
            overflow="hidden"
            position="relative"
          >
            {canRenderBackground && sidebarScrimEnabled && !isDark && (
              <Box
                position="absolute"
                inset={0}
                pointerEvents="none"
                bg={`rgb(255 255 255 / ${sidebarScrimAlpha})`}
              />
            )}
            <Box
              h="10px"
              w="14px"
              borderRadius="full"
              bg="color(from var(--gem-sys-color--on-surface-variant, #5f6368) srgb r g b/.42)"
            />
            <Box h={2} />
            {[false, false, true, false, false].map((isActive, idx) => (
              <HStack
                key={idx}
                h="24px"
                px={1.5}
                borderRadius="full"
                bg={isActive ? accentColor : 'transparent'}
              >
                <Box
                  h="6px"
                  w={isActive ? '30px' : idx % 2 === 0 ? '20px' : '16px'}
                  borderRadius="full"
                  bg={
                    isActive
                      ? 'rgba(255,255,255,0.92)'
                      : 'color(from var(--gem-sys-color--on-surface-variant, #5f6368) srgb r g b/.45)'
                  }
                />
              </HStack>
            ))}
            <Box flex="1" />
            <Box
              h="24px"
              borderRadius="full"
              bg="color(from var(--gem-sys-color--on-surface-variant, #5f6368) srgb r g b/.14)"
            />
          </VStack>

          <VStack
            flex="1"
            p={4}
            gap={3}
            align="stretch"
            bg={isDark ? 'rgba(2, 6, 23, 0.14)' : 'rgba(255, 255, 255, 0.08)'}
          >
            <HStack
              justify="space-between"
              px={3}
              py={2}
              borderRadius="xl"
              bg={surfaceBg}
              border="1px solid"
              borderColor={surfaceBorder}
              backdropFilter={previewGlassEnabled ? 'blur(18px)' : undefined}
            >
              <Box
                h="8px"
                w="72px"
                borderRadius="full"
                bg={hexToRgbaString(textColor, 0.42)}
              />
              <HStack gap={1.5}>
                <Box h="8px" w="8px" borderRadius="full" bg={hexToRgbaString(textColor, 0.38)} />
                <Box h="8px" w="8px" borderRadius="full" bg={hexToRgbaString(textColor, 0.38)} />
              </HStack>
            </HStack>

            <VStack
              flex="1"
              align="stretch"
              gap={3}
            >
              <Box
                width="100%"
                maxW="100%"
                alignSelf="center"
              >
                <HStack
                  alignItems="flex-start"
                  maxW="250px"
                  gap={1.5}
                  pt={0.5}
                >
                  <PreviewAssistantIcon />
                  <Box
                    px={3}
                    py={2}
                    borderRadius="xl"
                    bg={bubbleBg}
                    backdropFilter={previewGlassEnabled ? 'blur(20px)' : undefined}
                    border={`1px solid ${surfaceBorder}`}
                    boxShadow={`0 10px 30px ${hexToRgbaString(accentColor, isDark ? 0.18 : 0.12)}`}
                    color={textColor}
                    fontSize="xs"
                    lineHeight="1.45"
                  >
                    Text color is now independent, so the content stays readable on wallpaper.
                  </Box>
                </HStack>
              </Box>

              <Box alignSelf="flex-end" maxW="205px">
                <Box
                  px={3}
                  py={2}
                  borderRadius="xl"
                  borderBottomRightRadius="sm"
                  bg={userBubbleBg}
                  backdropFilter={previewGlassEnabled ? 'blur(18px)' : undefined}
                  border={`1px solid ${surfaceBorder}`}
                  color={textColor}
                  fontSize="xs"
                  lineHeight="1.4"
                >
                  Accent color handles actions. Surface color handles the card.
                </Box>
              </Box>

              <Box flex="1" />

              <VStack
                align="stretch"
                gap={2}
                width="100%"
                maxW="100%"
                alignSelf="center"
              >
                <HStack
                  gap={2}
                  p={2}
                  borderRadius="full"
                  bg={composerBg}
                  border="1px solid"
                  borderColor={surfaceBorder}
                  backdropFilter={previewGlassEnabled ? 'blur(18px)' : undefined}
                >
                  <Box
                    flex="1"
                    h="12px"
                    borderRadius="full"
                    bg={hexToRgbaString(textColor, 0.22)}
                  />
                  <Box
                    as="span"
                    width="28px"
                    height="28px"
                    borderRadius="full"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    bg={accentColor}
                    color="white"
                    fontSize="11px"
                    fontWeight="bold"
                  >
                    &gt;
                  </Box>
                </HStack>
                <Box
                  alignSelf="center"
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg={surfaceBg}
                  border="1px solid"
                  borderColor={surfaceBorder}
                  backdropFilter={previewGlassEnabled ? 'blur(18px)' : undefined}
                  color={hexToRgbaString(textColor, 0.72)}
                  fontSize="10px"
                >
                  Content is generated by AI. Double-check important details.
                </Box>
              </VStack>
            </VStack>
          </VStack>
        </HStack>
      </Box>
    </Box>
  )
}
