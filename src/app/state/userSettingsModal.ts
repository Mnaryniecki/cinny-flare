import { atom } from 'jotai';

export enum SettingsPages {
  GeneralPage,
  AccountPage,
  ProfileFlarePage,
  NotificationPage,
  DevicesPage,
  EmojisStickersPage,
  DeveloperToolsPage,
  AboutPage,
}

export type UserSettingsModalState = {
  page?: SettingsPages;
};

export const userSettingsModalAtom = atom<UserSettingsModalState | undefined>(undefined);
