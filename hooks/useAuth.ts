import { UserProfile } from '../types';

// Stable reference — defined OUTSIDE the hook so it never triggers
// referential inequality on re-renders.
const LOCAL_USER: UserProfile = {
    id: 'local',
    name: 'UserMap Owner',
    email: 'local@usermap'
};

export const useAuth = () => {
    return {
        currentUser: LOCAL_USER,
        isInitializing: false,
        login: async () => {},
        register: async () => {},
        logout: () => {},
        clearCacheAndReload: () => window.location.reload()
    };
};
