import { Box, Button, config, Icon, Icons, Text } from 'folds';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserHero, UserHeroName } from './UserHero';
import { getMxIdServer, mxcUrlToHttp } from '../../utils/matrix';
import { getMemberAvatarMxc, getMemberDisplayName } from '../../utils/room';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { useMediaAuthentication } from '../../hooks/useMediaAuthentication';
import { usePowerLevels } from '../../hooks/usePowerLevels';
import { useRoom } from '../../hooks/useRoom';
import { useUserPresence } from '../../hooks/useUserPresence';
import { IgnoredUserAlert, MutualRoomsChip, OptionsChip, ServerChip, ShareChip } from './UserChips';
import { useCloseUserRoomProfile } from '../../state/hooks/userRoomProfile';
import { PowerChip } from './PowerChip';
import { UserInviteAlert, UserBanAlert, UserModeration, UserKickAlert } from './UserModeration';
import { useIgnoredUsers } from '../../hooks/useIgnoredUsers';
import { useMembership } from '../../hooks/useMembership';
import { Membership } from '../../../types/matrix/room';
import { useRoomCreators } from '../../hooks/useRoomCreators';
import { useRoomPermissions } from '../../hooks/useRoomPermissions';
import { useMemberPowerCompare } from '../../hooks/useMemberPowerCompare';
import { CreatorChip } from './CreatorChip';
import { getDirectCreatePath, withSearchParam } from '../../pages/pathUtils';
import { DirectCreateSearchParams } from '../../pages/paths';
import {
  useUserFlare,
  FlareProfileBoard,
  ProfileCardFrameWrapper,
  ProfileEffectOverlay,
} from '../../features/flare';
import {
  useOpenUserSettingsModal,
  SettingsPages,
} from '../../state/hooks/userSettingsModal';

type UserRoomProfileProps = {
  userId: string;
};
export function UserRoomProfile({ userId }: UserRoomProfileProps) {
  const mx = useMatrixClient();
  const { flare } = useUserFlare(userId);
  const openUserSettings = useOpenUserSettingsModal();
  const useAuthentication = useMediaAuthentication();
  const navigate = useNavigate();
  const closeUserRoomProfile = useCloseUserRoomProfile();
  const ignoredUsers = useIgnoredUsers();
  const ignored = ignoredUsers.includes(userId);

  const room = useRoom();
  const powerLevels = usePowerLevels(room);
  const creators = useRoomCreators(room);

  const permissions = useRoomPermissions(creators, powerLevels);
  const { hasMorePower } = useMemberPowerCompare(creators, powerLevels);

  const myUserId = mx.getSafeUserId();
  const creator = creators.has(userId);

  const canKickUser = permissions.action('kick', myUserId) && hasMorePower(myUserId, userId);
  const canBanUser = permissions.action('ban', myUserId) && hasMorePower(myUserId, userId);
  const canUnban = permissions.action('ban', myUserId);
  const canInvite = permissions.action('invite', myUserId);

  const member = room.getMember(userId);
  const membership = useMembership(room, userId);

  const server = getMxIdServer(userId);
  const displayName = getMemberDisplayName(room, userId);
  const avatarMxc = getMemberAvatarMxc(room, userId);
  const avatarUrl = (avatarMxc && mxcUrlToHttp(mx, avatarMxc, useAuthentication)) ?? undefined;

  const presence = useUserPresence(userId);

  const handleMessage = () => {
    closeUserRoomProfile();
    const directSearchParam: DirectCreateSearchParams = {
      userId,
    };
    navigate(withSearchParam(getDirectCreatePath(), directSearchParam));
  };

  const handleEditProfile = () => {
    closeUserRoomProfile();
    openUserSettings(SettingsPages.AccountPage);
  };

  return (
    <ProfileCardFrameWrapper frame={flare?.profileFrame}>
      <div
        style={{
          position: 'relative',
          background: flare?.cardTheme?.gradient || undefined,
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <ProfileEffectOverlay effect={flare?.profileEffect} />
        <Box direction="Column">
          <UserHero
            userId={userId}
            avatarUrl={avatarUrl}
            presence={presence && presence.lastActiveTs !== 0 ? presence : undefined}
            flare={flare}
          />
          <Box direction="Column" gap="500" style={{ padding: config.space.S400 }}>
            <Box direction="Column" gap="400">
              <Box gap="400" alignItems="Start" justifyContent="SpaceBetween">
                <UserHeroName displayName={displayName} userId={userId} flare={flare} />
                {userId !== myUserId ? (
                  <Box shrink="No">
                    <Button
                      size="300"
                      variant="Primary"
                      fill="Solid"
                      radii="300"
                      before={<Icon size="50" src={Icons.Message} filled />}
                      onClick={handleMessage}
                    >
                      <Text size="B300">Message</Text>
                    </Button>
                  </Box>
                ) : (
                  <Box shrink="No">
                    <Button
                      size="300"
                      variant="Primary"
                      fill="Solid"
                      radii="300"
                      before={<Icon size="50" src={Icons.Pencil} filled />}
                      onClick={handleEditProfile}
                    >
                      <Text size="B300">Edit Profile & Flair</Text>
                    </Button>
                  </Box>
                )}
              </Box>
              <Box alignItems="Center" gap="200" wrap="Wrap">
                {server && <ServerChip server={server} />}
                <ShareChip userId={userId} />
                {creator ? <CreatorChip /> : <PowerChip userId={userId} />}
                {userId !== myUserId && <MutualRoomsChip userId={userId} />}
                {userId !== myUserId && <OptionsChip userId={userId} />}
              </Box>
            </Box>
            <FlareProfileBoard flare={flare} />
            {ignored && <IgnoredUserAlert />}
            {member && membership === Membership.Ban && (
              <UserBanAlert
                userId={userId}
                reason={member.events.member?.getContent().reason}
                canUnban={canUnban}
                bannedBy={member.events.member?.getSender()}
                ts={member.events.member?.getTs()}
              />
            )}
            {member &&
              membership === Membership.Leave &&
              member.events.member &&
              member.events.member.getSender() !== userId && (
                <UserKickAlert
                  reason={member.events.member?.getContent().reason}
                  kickedBy={member.events.member?.getSender()}
                  ts={member.events.member?.getTs()}
                />
              )}
            {member && membership === Membership.Invite && (
              <UserInviteAlert
                userId={userId}
                reason={member.events.member?.getContent().reason}
                canKick={canKickUser}
                invitedBy={member.events.member?.getSender()}
                ts={member.events.member?.getTs()}
              />
            )}
            <UserModeration
              userId={userId}
              canInvite={canInvite && membership === Membership.Leave}
              canKick={canKickUser && membership === Membership.Join}
              canBan={canBanUser && membership !== Membership.Ban}
            />
          </Box>
        </Box>
      </div>
    </ProfileCardFrameWrapper>
  );
}
