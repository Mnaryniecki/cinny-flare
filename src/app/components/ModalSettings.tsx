import React, { ReactNode } from 'react';
import FocusTrap from 'focus-trap-react';
import { Modal, Overlay, OverlayBackdrop, OverlayCenter } from 'folds';
import { stopPropagation } from '../utils/keyboard';

type ModalSettingsProps = {
  requestClose: () => void;
  children: ReactNode;
};

export function ModalSettings({ requestClose, children }: ModalSettingsProps) {
  return (
    <Overlay open backdrop={<OverlayBackdrop />}>
      <OverlayCenter>
        <FocusTrap
          focusTrapOptions={{
            initialFocus: false,
            clickOutsideDeactivates: true,
            onDeactivate: requestClose,
            escapeDeactivates: stopPropagation,
          }}
        >
          <Modal className="cinny-settings-modal" size="500" variant="Background">
            {children}
          </Modal>
        </FocusTrap>
      </OverlayCenter>
    </Overlay>
  );
}
