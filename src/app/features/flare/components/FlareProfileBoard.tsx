import React from 'react';
import { Box, Chip, Text, config } from 'folds';
import { ProfileFlare, ShowcaseBoard } from '../types';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { useMediaAuthentication } from '../../../hooks/useMediaAuthentication';
import { mxcUrlToHttp } from '../../../utils/matrix';

type FlareProfileBoardProps = {
  flare?: ProfileFlare | null;
  className?: string;
};

export function FlareProfileBoard({ flare, className }: FlareProfileBoardProps) {
  const mx = useMatrixClient();
  const useAuth = useMediaAuthentication();

  if (!flare) return null;

  const resolveMediaUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('mxc://')) {
      return mxcUrlToHttp(mx, url, useAuth) ?? undefined;
    }
    return url;
  };

  const hasBadges = flare.badges && flare.badges.length > 0;
  const hasBoards = flare.boards && flare.boards.length > 0;
  const hasBio = Boolean(flare.bio || flare.headline || flare.pronouns);

  if (!hasBadges && !hasBoards && !hasBio) {
    return null;
  }

  return (
    <Box direction="Column" gap="400" className={className} style={{ width: '100%' }}>
      {/* Pronouns / Headline */}
      {(flare.pronouns || flare.headline) && (
        <Box direction="Column" gap="100">
          {flare.pronouns && (
            <Text size="T200" style={{ opacity: 0.6 }}>
              {flare.pronouns}
            </Text>
          )}
          {flare.headline && (
            <Text size="T300" style={{ fontWeight: config.fontWeight.W600 }}>
              {flare.headline}
            </Text>
          )}
        </Box>
      )}

      {/* Badges Bar */}
      {hasBadges && (
        <Box alignItems="Center" gap="150" wrap="Wrap">
          {flare.badges!.map((badge) => {
            const iconSrc = resolveMediaUrl(badge.iconUrl);
            return (
              <Chip
                key={badge.id}
                size="200"
                radii="Pill"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  padding: '2px 8px',
                }}
                title={badge.description || badge.label}
              >
                {iconSrc ? (
                  <img
                    src={iconSrc}
                    alt={badge.label}
                    style={{ width: 14, height: 14, borderRadius: 3, marginRight: 4 }}
                  />
                ) : badge.emoji ? (
                  <span style={{ marginRight: 4 }}>{badge.emoji}</span>
                ) : null}
                <Text size="L200">{badge.label}</Text>
              </Chip>
            );
          })}
        </Box>
      )}

      {/* Bio text */}
      {flare.bio && (
        <Box
          direction="Column"
          style={{
            padding: '10px 14px',
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            whiteSpace: 'pre-wrap',
          }}
        >
          <Text size="T200" style={{ lineHeight: 1.5 }}>
            {flare.bio}
          </Text>
        </Box>
      )}

      {/* Showcase Boards (e.g. Games, Showcases, Grids) */}
      {hasBoards && (
        <Box direction="Column" gap="300">
          {flare.boards!.map((board) => (
            <BoardWidget key={board.id} board={board} resolveMediaUrl={resolveMediaUrl} />
          ))}
        </Box>
      )}
    </Box>
  );
}

function BoardWidget({
  board,
  resolveMediaUrl,
}: {
  board: ShowcaseBoard;
  resolveMediaUrl: (url?: string) => string | undefined;
}) {
  return (
    <Box
      direction="Column"
      gap="250"
      style={{
        padding: '12px 14px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <Box justifyContent="SpaceBetween" alignItems="Center">
        <Text size="L300" style={{ fontWeight: config.fontWeight.W700, letterSpacing: '0.02em' }}>
          {board.title}
        </Text>
        <Text size="L100" style={{ opacity: 0.5 }}>
          {board.items.length} {board.items.length === 1 ? 'item' : 'items'}
        </Text>
      </Box>

      {/* Board Item Cards */}
      {board.type === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
            gap: '8px',
          }}
        >
          {board.items.map((item) => {
            const imgSrc = resolveMediaUrl(item.imageUrl);
            return (
              <div
                key={item.id}
                title={item.title}
                style={{
                  position: 'relative',
                  aspectRatio: '3 / 4',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: item.link ? 'pointer' : 'default',
                  transition: 'transform 0.15s ease',
                }}
                onClick={item.link ? () => window.open(item.link, '_blank') : undefined}
              >
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 4,
                      textAlign: 'center',
                    }}
                  >
                    <Text size="L100">{item.title}</Text>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed list of items with tags */
        <Box direction="Column" gap="200">
          {board.items.map((item) => {
            const imgSrc = resolveMediaUrl(item.imageUrl);
            return (
              <Box
                key={item.id}
                alignItems="Center"
                gap="300"
                style={{
                  padding: '6px 8px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt={item.title}
                    style={{
                      width: 44,
                      height: 58,
                      borderRadius: '5px',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                )}
                <Box direction="Column" gap="100" style={{ flex: 1, minWidth: 0 }}>
                  <Text size="T200" style={{ fontWeight: config.fontWeight.W600 }} truncate>
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text size="T100" style={{ opacity: 0.6 }} truncate>
                      {item.subtitle}
                    </Text>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <Box alignItems="Center" gap="100" wrap="Wrap" style={{ marginTop: 2 }}>
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '11px',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: 'rgba(255, 255, 255, 0.8)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
