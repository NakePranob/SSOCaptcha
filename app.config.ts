export default defineAppConfig({
    ui: {
      primary: 'primary-app',
      gray: 'zinc',
      notification: {
        default: {
          timeout: 15000,
        },
      },
      notifications: {
        // Show toasts at the top right of the screen
        position: '-me-4 -right-4 -top-2 bottom-[unset]'
      },
      input: {
        default: {
          rounded: `rounded-[8px]`,
        },
        padding: {
          '2xs': 'px-2 py-1',
          xs: 'px-2.5 py-1.5',
          sm: 'px-2.5 py-1.5',
          md: 'px-3 py-2',
          lg: 'px-3.5 py-2.5',
          xl: 'px-6 py-4'
        },
      },
      button: {
        padding: {
          '2xs': 'px-2 py-1',
          xs: 'px-2.5 py-1.5',
          sm: 'px-2.5 py-1.5',
          md: 'px-3 py-2',
          lg: 'px-3.5 py-2.5',
          xl: 'px-6 py-4'
        },
      },
    }
  })