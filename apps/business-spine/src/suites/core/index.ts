// Core Suite - Foundation architecture and core systems

// Providers
export { default as AppProvider, useAppContext } from '../providers/AppContext';

// Components
export { default as Shell } from '../components/Shell';

// Hooks
export { default as usePageState } from '../hooks/usePageState';
export { default as useMediaQuery } from '../hooks/useMediaQuery';

// Lib
export { ROUTES, NAVIGATION_ITEMS, isRouteActive } from '../lib/routes';

// Types
export type { AppUIState, NotificationType, ModalType } from '../providers/AppContext';
