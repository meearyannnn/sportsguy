'use client';

import { useEffect, useRef } from 'react';

interface ModalStackState {
  hasOpenModal: boolean;
  onDismissTopModal: () => void;
}

/**
 * Mobile Hardware Back-Button & Gesture Navigation Hook
 * Intercepts Android hardware back button and iOS swipe-back gestures
 * to dismiss open modal overlays (Driver Dossier, Livery, Glance, Search)
 * instead of unexpectedly navigating away from the web app.
 */
export function useMobileHistory({
  hasOpenModal,
  onDismissTopModal,
}: ModalStackState) {
  const isPushedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (hasOpenModal && !isPushedRef.current) {
      // Push dummy history entry for the open modal
      window.history.pushState({ modal: true }, '');
      isPushedRef.current = true;
    } else if (!hasOpenModal && isPushedRef.current) {
      isPushedRef.current = false;
    }

    const handlePopState = (event: PopStateEvent) => {
      if (hasOpenModal) {
        // Intercept back button and dismiss the modal
        onDismissTopModal();
        isPushedRef.current = false;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasOpenModal, onDismissTopModal]);
}
