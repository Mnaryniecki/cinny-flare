import React, { ReactNode } from 'react';
import { as, Avatar, Box, Icon, Icons, Text } from 'folds';
import { MatrixClient, Room, RoomMember } from 'matrix-js-sdk';
import { getMemberDisplayName } from '../../utils/room';
import { getMxIdLocalPart } from '../../utils/matrix';
import { UserAvatar } from '../user-avatar';
import * as css from './style.css';
import { useUserFlare, AvatarDecorationOverlay, UserNameplate } from '../../features/flare';

const getName = (room: Room, member: RoomMember) =>
  getMemberDisplayName(room, member.userId) ?? getMxIdLocalPart(member.userId) ?? member.userId;

type MemberTileProps = {
  mx: MatrixClient;
  room: Room;
  member: RoomMember;
  useAuthentication: boolean;
  after?: ReactNode;
};
export const MemberTile = as<'button', MemberTileProps>(
  ({ as: AsMemberTile = 'button', mx, room, member, useAuthentication, after, ...props }, ref) => {
    const name = getName(room, member);
    const username = getMxIdLocalPart(member.userId);
    const { flare } = useUserFlare(member.userId);

    const avatarMxcUrl = member.getMxcAvatarUrl();
    const avatarUrl = avatarMxcUrl
      ? mx.mxcUrlToHttp(avatarMxcUrl, 100, 100, 'crop', undefined, false, useAuthentication)
      : undefined;

    return (
      <AsMemberTile className={css.MemberTile} {...props} ref={ref}>
        <div style={{ position: 'relative', display: 'inline-flex' }}>
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
        <Box grow="Yes" as="span" direction="Column">
          <UserNameplate nameplate={flare?.nameplate} font={flare?.font}>
            <Text as="span" size="T300" truncate>
              <b>{name}</b>
            </Text>
          </UserNameplate>
          <Box alignItems="Center" justifyContent="SpaceBetween" gap="100">
            <Text as="span" size="T200" priority="300" truncate>
              {username}
            </Text>
          </Box>
        </Box>
        {after}
      </AsMemberTile>
    );
  }
);
