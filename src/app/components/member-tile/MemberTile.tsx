import React, { ReactNode } from 'react';
import { as, Avatar, Box, Icon, Icons, Text } from 'folds';
import { MatrixClient, Room, RoomMember } from 'matrix-js-sdk';
import { getMemberDisplayName } from '../../utils/room';
import { getMxIdLocalPart } from '../../utils/matrix';
import { UserAvatar } from '../user-avatar';
import * as css from './style.css';
import {
  useUserFlare,
  AvatarDecorationOverlay,
  UserDisplayName,
  PRESET_NAMEPLATES,
} from '../../features/flare';

const getName = (room: Room, member: RoomMember) =>
  getMemberDisplayName(room, member.userId) ?? getMxIdLocalPart(member.userId) ?? member.userId;

type MemberTileProps = {
  mx: MatrixClient;
  room: Room;
  member: RoomMember;
  useAuthentication: boolean;
  after?: ReactNode;
  style?: React.CSSProperties;
};
export const MemberTile = as<'button', MemberTileProps>(
  ({ as: AsMemberTile = 'button', mx, room, member, useAuthentication, after, style, ...props }, ref) => {
    const name = getName(room, member);
    const username = getMxIdLocalPart(member.userId);
    const { flare } = useUserFlare(member.userId);

    const avatarMxcUrl = member.getMxcAvatarUrl();
    const avatarUrl = avatarMxcUrl
      ? mx.mxcUrlToHttp(avatarMxcUrl, 100, 100, 'crop', undefined, false, useAuthentication)
      : undefined;

    // Discord Nameplate: Decorates the member tile in the server list!
    const nameplate = flare?.nameplate;
    const nameplatePreset = nameplate?.preset
      ? PRESET_NAMEPLATES.find((p) => p.id === nameplate.preset)
      : undefined;

    let nameplateBg = nameplate?.gradient || nameplatePreset?.gradient;
    let nameplateBorder = nameplatePreset?.border || (nameplate?.url ? '1px solid rgba(255, 255, 255, 0.15)' : undefined);

    if (nameplate?.url) {
      const resolved = nameplate.url.startsWith('mxc://')
        ? mx.mxcUrlToHttp(nameplate.url, 300, 60, 'crop', undefined, false, useAuthentication)
        : nameplate.url;
      if (resolved) {
        nameplateBg = `url(${resolved}) center/cover no-repeat`;
      }
    }

    return (
      <AsMemberTile
        className={css.MemberTile}
        {...props}
        ref={ref}
        style={{
          background: nameplateBg || undefined,
          border: nameplateBorder || undefined,
          borderRadius: nameplateBg ? '8px' : undefined,
          boxShadow: nameplateBg ? '0 2px 8px rgba(0, 0, 0, 0.4)' : undefined,
          position: 'relative',
          overflow: 'hidden',
          ...style,
        }}
      >
        <div style={{ position: 'relative', display: 'inline-flex', zIndex: 1 }}>
          <Avatar size="300" radii="Pill">
            <UserAvatar
              userId={member.userId}
              src={avatarUrl ?? undefined}
              alt={name}
              renderFallback={() => <Icon size="300" src={Icons.User} filled />}
            />
          </Avatar>
          {flare?.avatarDecoration?.url && (
            <AvatarDecorationOverlay decoration={flare.avatarDecoration} />
          )}
        </div>
        <Box grow="Yes" as="span" direction="Column" style={{ position: 'relative', zIndex: 1 }}>
          <UserDisplayName style={flare?.displayNameStyle || flare?.font}>
            <Text as="span" size="T300" truncate>
              <b>{name}</b>
            </Text>
          </UserDisplayName>
          <Box alignItems="Center" justifyContent="SpaceBetween" gap="100">
            <Text as="span" size="T200" priority="300" truncate style={{ color: nameplateBg ? '#e5e7eb' : undefined }}>
              {username}
            </Text>
          </Box>
        </Box>
        {after}
      </AsMemberTile>
    );
  }
);
