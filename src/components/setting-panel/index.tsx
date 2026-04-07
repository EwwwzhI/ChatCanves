import React, { useEffect, useId, useState } from "react"
import { Box, CloseButton, Heading, HStack, Text, VStack } from "@chakra-ui/react"
import { HiOutlineColorSwatch } from "react-icons/hi"
import { ThemeSettingsView } from "./views/theme"
import { useEventEmitter } from "../../hooks/useEventBus"
import { tt } from "@/utils/i18n"
import { isExtensionContextValid } from "@/utils/contextMonitor"

const LAUNCHER_LABEL_FALLBACK = 'Theme'

export const SettingPanel = () => {
  const [open, setOpen] = useState(false)
  const { emit } = useEventEmitter()
  const titleId = useId()

  useEffect(() => {
    emit('settings:state-changed', { open })
  }, [emit, open])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const launcherLabel = tt('settingPanel.theme.launcherLabel', LAUNCHER_LABEL_FALLBACK)
  const handleOpen = () => {
    if (!isExtensionContextValid()) {
      emit('settings:state-changed', { open: true })
      return
    }

    setOpen(true)
  }

  return (
    <Box position="fixed" inset={0} zIndex={9999999999} pointerEvents="none">
      <Box
        as="button"
        position="absolute"
        right={0}
        top={{ base: 'auto', md: '50%' }}
        bottom={{ base: 18, md: 'auto' }}
        transform={{
          base: open ? 'translateX(20px)' : 'translateX(0)',
          md: open ? 'translateX(20px) translateY(-50%)' : 'translateY(-50%)',
        }}
        opacity={open ? 0 : 1}
        pointerEvents={open ? 'none' : 'auto'}
        transition="transform 220ms ease, opacity 180ms ease, box-shadow 180ms ease"
        width={{ base: '52px', md: '56px' }}
        height={{ base: '52px', md: '56px' }}
        borderRadius="full"
        border="1px solid"
        borderColor="var(--gpk-panel-accent-border)"
        bg="rgba(255, 255, 255, 0.84)"
        backdropFilter="blur(18px)"
        boxShadow="0 18px 42px rgba(15, 23, 42, 0.18)"
        color="gemOnSurface"
        cursor="pointer"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        aria-label={launcherLabel}
        title={launcherLabel}
        _hover={{
          transform: {
            base: 'translateX(-4px)',
            md: 'translate(-4px, -50%)',
          },
          boxShadow: '0 22px 50px rgba(15, 23, 42, 0.22)',
        }}
        onClick={handleOpen}
      >
        <Box
          width="34px"
          height="34px"
          borderRadius="full"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          bg="var(--gpk-panel-accent)"
          color="var(--gpk-panel-accent-contrast)"
          flexShrink={0}
        >
          <HiOutlineColorSwatch size={18} />
        </Box>
      </Box>

      <Box
        position="absolute"
        inset={0}
        pointerEvents={open ? 'auto' : 'none'}
        opacity={open ? 1 : 0}
        transition="opacity 220ms ease"
      >
        <Box
          position="absolute"
          inset={0}
          bg="rgba(15, 23, 42, 0.22)"
          backdropFilter="blur(3px)"
          onClick={() => setOpen(false)}
        />

        <Box
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          width={{ base: 'min(100vw - 16px, 560px)', lg: 'min(620px, calc(100vw - 24px))' }}
          pointerEvents="auto"
          transform={open ? 'translateX(0)' : 'translateX(calc(100% + 32px))'}
          transition="transform 260ms cubic-bezier(0.22, 1, 0.36, 1)"
          borderLeft="1px solid"
          borderColor="var(--gpk-panel-accent-border)"
          borderTopLeftRadius={{ base: '28px', md: '32px' }}
          borderBottomLeftRadius={{ base: '28px', md: '32px' }}
          bg="rgba(255, 255, 255, 0.82)"
          boxShadow="-24px 0 60px rgba(15, 23, 42, 0.16)"
          backdropFilter="blur(28px)"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <Box
            position="absolute"
            insetX={0}
            top={0}
            height="96px"
            bg="linear-gradient(180deg, var(--gpk-panel-accent-soft) 0%, rgba(255,255,255,0) 100%)"
            pointerEvents="none"
          />

          <Box px={{ base: 5, md: 6 }} pt={{ base: 5, md: 6 }} pb={4} position="relative" zIndex={1}>
            <HStack justify="space-between" align="flex-start" gap={4}>
              <VStack align="stretch" gap={2}>
                <Heading id={titleId} size="lg">
                  {tt('settingPanel.config.theme.views.index.title', 'Theme Settings')}
                </Heading>
                <Text color="gemOnSurfaceVariant" fontSize="sm" maxW="420px">
                  {tt(
                    'settingPanel.config.theme.views.index.description',
                    'Customize Gemini\'s color theme and background to match your style.',
                  )}
                </Text>
              </VStack>

              <CloseButton
                size="sm"
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.7)"
                onClick={() => setOpen(false)}
              />
            </HStack>
          </Box>

          <Box flex="1" minH={0} px={{ base: 5, md: 6 }} pb={{ base: 5, md: 6 }}>
            <ThemeSettingsView />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
