import React from 'react';
import { ModalSettings } from './ModalSettings';
import { Settings } from '../features/settings';
import {
  useUserSettingsModalState,
  useCloseUserSettingsModal,
} from '../state/hooks/userSettingsModal';

export function UserSettingsRenderer() {
  const state = useUserSettingsModalState();
  const closeSettings = useCloseUserSettingsModal();

  if (!state) return null;

  return (
    <ModalSettings requestClose={closeSettings}>
      <Settings initialPage={state.page as any} requestClose={closeSettings} />
    </ModalSettings>
  );
}
