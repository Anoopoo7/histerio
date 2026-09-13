export {};

declare global {
  namespace google {
    namespace accounts {
      namespace id {
        interface CredentialResponse {
          credential: string;
          select_by?: string;
        }

        interface GsiButtonConfiguration {
          type?: 'standard' | 'icon';
          theme?: 'outline' | 'filled_blue' | 'filled_black';
          size?: 'large' | 'medium' | 'small';
          text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
          shape?: 'rectangular' | 'pill' | 'circle' | 'square';
          logo_alignment?: 'left' | 'center';
          width?: number | string;
          locale?: string;
        }

        interface IdConfiguration {
          client_id: string;
          callback: (response: CredentialResponse) => void;
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
          context?: 'signin' | 'signup' | 'use';
        }

        function initialize(configuration: IdConfiguration): void;
        function renderButton(parent: HTMLElement, options: GsiButtonConfiguration): void;
        function prompt(
          momentListener?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            isDismissedMoment: () => boolean;
            getNotDisplayedReason: () => string;
            getSkippedReason: () => string;
            getDismissedReason: () => string;
          }) => void,
        ): void;
        function disableAutoSelect(): void;
        function revoke(hint: string, callback?: (response: { successful: boolean; error?: string }) => void): void;
      }
    }
  }

  interface Window {
    google?: typeof google;
  }
}
