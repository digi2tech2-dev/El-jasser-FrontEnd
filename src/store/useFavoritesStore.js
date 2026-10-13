import { create } from 'zustand';

const STORAGE_KEY = 'el-jasser:favorite-products:v1';

const readFavorites = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
    return Object.fromEntries(Object.entries(saved).map(([key, ids]) => [
      key,
      Array.isArray(ids) ? [...new Set(ids.map(String).filter(Boolean))] : [],
    ]));
  } catch {
    return {};
  }
};

export const favoriteUserKey = (user) => String(
  user?.id || user?._id || user?.userId || user?.email || ''
).trim();

const useFavoritesStore = create((set) => ({
  favoritesByUser: readFavorites(),
  toggleFavorite: (userKey, productId) => set((state) => {
    const id = String(productId || '').trim();
    if (!userKey || !id) return state;
    const current = state.favoritesByUser[userKey] || [];
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    const favoritesByUser = { ...state.favoritesByUser, [userKey]: next };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritesByUser));
    } catch {
      // Keep the current session usable if device storage is unavailable.
    }
    return { favoritesByUser };
  }),
}));

export default useFavoritesStore;
