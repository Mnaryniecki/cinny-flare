import { useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  userSettingsModalAtom,
  UserSettingsModalState,
  SettingsPages,
} from '../userSettingsModal';

export { SettingsPages };

export const useUserSettingsModalState = (): UserSettingsModalState | undefined => {
  return useAtomValue(userSettingsModalAtom);
};

export const useCloseUserSettingsModal = (): (() => void) => {
  const setSettings = useSetAtom(userSettingsModalAtom);
  return useCallback(() => {
    setSettings(undefined);
  }, [setSettings]);
};

export const useOpenUserSettingsModal = (): ((page?: SettingsPages) => void) => {
  const setSettings = useSetAtom(userSettingsModalAtom);
  return useCallback(
    (page?: SettingsPages) => {
      setSettings({ page });
    },
    [setSettings]
  );
};
