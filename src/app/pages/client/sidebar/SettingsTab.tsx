import React, { useState } from 'react';
import { Text } from 'folds';
import { SidebarItem, SidebarItemTooltip, SidebarAvatar } from '../../../components/sidebar';
import { UserAvatar } from '../../../components/user-avatar';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { getMxIdLocalPart, mxcUrlToHttp } from '../../../utils/matrix';
import { nameInitials } from '../../../utils/common';
import { useMediaAuthentication } from '../../../hooks/useMediaAuthentication';
import { Settings } from '../../../features/settings';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { ModalSettings } from '../../../components/ModalSettings';
import {
  useUserSettingsModalState,
  useOpenUserSettingsModal,
  useCloseUserSettingsModal,
} from '../../../state/hooks/userSettingsModal';

export function SettingsTab() {
  const mx = useMatrixClient();
  const useAuthentication = useMediaAuthentication();
  const userId = mx.getUserId()!;
  const profile = useUserProfile(userId);

  const settingsState = useUserSettingsModalState();
  const openSettings = useOpenUserSettingsModal();
  const closeSettings = useCloseUserSettingsModal();

  const displayName = profile.displayName ?? getMxIdLocalPart(userId) ?? userId;
  const avatarUrl = profile.avatarUrl
    ? mxcUrlToHttp(mx, profile.avatarUrl, useAuthentication, 96, 96, 'crop') ?? undefined
    : undefined;

  return (
    <SidebarItem active={settingsState !== undefined}>
      <SidebarItemTooltip tooltip="User Settings">
        {(triggerRef) => (
          <SidebarAvatar as="button" ref={triggerRef} onClick={() => openSettings()}>
            <UserAvatar
              userId={userId}
              src={avatarUrl}
              renderFallback={() => <Text size="H4">{nameInitials(displayName)}</Text>}
            />
          </SidebarAvatar>
        )}
      </SidebarItemTooltip>
    </SidebarItem>
  );
}
