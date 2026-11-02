import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Icon,
  Icons,
  Modal,
  Overlay,
  OverlayBackdrop,
  OverlayCenter,
  Text,
} from 'folds';
import classNames from 'classnames';
import FocusTrap from 'focus-trap-react';
import * as css from './styles.css';
import { UserAvatar } from '../user-avatar';
import colorMXID from '../../../util/colorMXID';
import { getMxIdLocalPart } from '../../utils/matrix';
import { BreakWord, LineClamp3 } from '../../styles/Text.css';
import { UserPresence } from '../../hooks/useUserPresence';
import { AvatarPresence, PresenceBadge } from '../presence';
import { ImageViewer } from '../image-viewer';
import { stopPropagation } from '../../utils/keyboard';
import { ProfileFlare, AvatarDecorationOverlay, UserNameplate, UserDisplayName } from '../../features/flare';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { useMediaAuthentication } from '../../hooks/useMediaAuthentication';
import { mxcUrlToHttp } from '../../utils/matrix';

type UserHeroProps = {
  userId: string;
  avatarUrl?: string;
  presence?: UserPresence;
  flare?: ProfileFlare | null;
};
export function UserHero({ userId, avatarUrl, presence, flare }: UserHeroProps) {
  const [viewAvatar, setViewAvatar] = useState<string>();
  const mx = useMatrixClient();
  const useAuth = useMediaAuthentication();

  const customBannerUrl = flare?.banner?.url ? mxcUrlToHttp(mx, flare.banner.url, useAuth) : undefined;
  const customGradient =
    flare?.banner?.gradient ||
    (flare?.banner?.themeColor
      ? `linear-gradient(135deg, ${flare.banner.themeColor} 0%, ${flare.banner.themeColor} 100%)`
      : undefined);

  return (
    <Box direction="Column" className={css.UserHero}>
      <div
        className={css.UserHeroCoverContainer}
        style={{
          background: customGradient || undefined,
          backgroundColor: customGradient ? undefined : colorMXID(userId),
          filter: avatarUrl || customBannerUrl || customGradient ? undefined : 'brightness(50%)',
        }}
      >
        {customBannerUrl ? (
          <img className={css.UserHeroCover} src={customBannerUrl} alt={userId} draggable="false" />
        ) : avatarUrl && !customGradient ? (
          <img className={css.UserHeroCover} src={avatarUrl} alt={userId} draggable="false" />
        ) : null}
      </div>
      <div className={css.UserHeroAvatarContainer}>
        <AvatarPresence
          className={css.UserAvatarContainer}
          badge={
            presence && <PresenceBadge presence={presence.presence} status={presence.status} />
          }
        >
          <div style={{ position: 'relative' }}>
            <Avatar
              as={avatarUrl ? 'button' : 'div'}
              onClick={avatarUrl ? () => setViewAvatar(avatarUrl) : undefined}
              className={css.UserHeroAvatar}
              size="500"
            >
              <UserAvatar
                className={css.UserHeroAvatarImg}
                userId={userId}
                src={avatarUrl}
                alt={userId}
                renderFallback={() => <Icon size="500" src={Icons.User} filled />}
              />
            </Avatar>
            {flare?.avatarDecoration?.url && (
              <AvatarDecorationOverlay decoration={flare.avatarDecoration} />
            )}
          </div>
        </AvatarPresence>
        {viewAvatar && (
          <Overlay open backdrop={<OverlayBackdrop />}>
            <OverlayCenter>
              <FocusTrap
                focusTrapOptions={{
                  initialFocus: false,
                  onDeactivate: () => setViewAvatar(undefined),
                  clickOutsideDeactivates: true,
                  escapeDeactivates: stopPropagation,
                }}
              >
                <Modal size="500" onContextMenu={(evt: any) => evt.stopPropagation()}>
                  <ImageViewer
                    src={viewAvatar}
                    alt={userId}
                    requestClose={() => setViewAvatar(undefined)}
                  />
                </Modal>
              </FocusTrap>
            </OverlayCenter>
          </Overlay>
        )}
      </div>
    </Box>
  );
}

type UserHeroNameProps = {
  displayName?: string;
  userId: string;
  flare?: ProfileFlare | null;
};
export function UserHeroName({ displayName, userId, flare }: UserHeroNameProps) {
  const username = getMxIdLocalPart(userId);

  return (
    <Box grow="Yes" direction="Column" gap="0">
      <Box alignItems="Baseline" gap="200" wrap="Wrap">
        <UserDisplayName style={flare?.displayNameStyle || flare?.font}>
          <Text
            size="H4"
            className={classNames(BreakWord, LineClamp3)}
            title={displayName ?? username}
          >
            {displayName ?? username ?? userId}
          </Text>
        </UserDisplayName>
      </Box>
      <Box alignItems="Center" gap="100" wrap="Wrap">
        <Text size="T200" className={classNames(BreakWord, LineClamp3)} title={username}>
          @{username}
        </Text>
      </Box>
    </Box>
  );
}
