const storageState = new Map<string, unknown>()
const storageWatchers = new Map<string, Set<(value: unknown) => void>>()

export function __resetStorageMock() {
  storageState.clear()
  storageWatchers.clear()
}

export const storage = {
  defineItem<T>(key: string, options: { fallback: T }) {
    return {
      async getValue(): Promise<T> {
        if (storageState.has(key)) {
          return storageState.get(key) as T
        }
        return options.fallback
      },
      async setValue(value: T): Promise<void> {
        storageState.set(key, value)
        storageWatchers.get(key)?.forEach((watcher) => {
          watcher(value)
        })
      },
      watch(callback: (value: T) => void) {
        const watchers = storageWatchers.get(key) ?? new Set()
        watchers.add(callback as (value: unknown) => void)
        storageWatchers.set(key, watchers)

        return () => {
          watchers.delete(callback as (value: unknown) => void)
          if (watchers.size === 0) {
            storageWatchers.delete(key)
          }
        }
      },
    }
  },
}
