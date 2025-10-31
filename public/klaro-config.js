// klaro-config.js
const klaroConfig = {
  // ────────────── BASIC SETTINGS ──────────────
  positions: ['bottom-right'],
  theme: 'light',
  hideLearnMore: false,
  blockAll: true,
  mustConsent: true,
  acceptAll: true,
  hideToggle: false,

  // ────────────── TEXTS (ENGLISH) ──────────────
  translations: {
    en: {
      consentModal: {
        title: 'Privacy Preferences',
        description: 'We use cookies for analytics and embedded videos. You can change your settings at any time.',
        acceptAll: 'Accept all',
        acceptSelection: 'Save selection',
        rejectAll: 'Reject all',
      },
      consentNotice: {
        title: 'We value your privacy',
        description: 'This site uses essential cookies and optional analytics/video services.',
        learnMore: 'Learn more',
      },
      purposes: {
        analytics: 'Analytics',
        videos: 'Videos',
      },
      privacyPolicy: {
        name: 'Privacy Policy',
        url: '/privacy',
      },
    },
  },

  // ────────────── PURPOSES ──────────────
  purposes: ['analytics', 'videos'],

  // ────────────── SERVICES ──────────────
  services: [
    // ────── YOUTUBE EMBEDS ──────
    {
      name: 'youtube',
      title: 'YouTube Videos',
      purposes: ['videos'],
      contextualConsentOnly: true,
      cookies: [],
    },

    // ────── GOOGLE ANALYTICS 4 (GA4) ──────
    {
      name: 'googleAnalytics',
      title: 'Google Analytics',
      purposes: ['analytics'],
      cookies: [
        [/^_ga(_.*)?$/, '/', '.bernardbolter.com'],
        ['_gid', '/', '.bernardbolter.com'],
        ['_gat', '/', '.bernardbolter.com'],
      ],
      src: [
        {
          src: `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`,
          type: 'text/javascript',
        },
      ],
      callback: function (consent) {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          window.dataLayer.push(arguments);
        }
        window.gtag = gtag;

        // Default: deny all
        gtag('consent', 'default', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'denied',
          functionality_storage: 'denied',
          personalization_storage: 'denied',
          security_storage: 'granted',
        });

        if (consent) {
          gtag('consent', 'update', {
            analytics_storage: 'granted',
          });
        }

        gtag('js', new Date());
        gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          send_page_view: true,
        });
      },
    },
  ],
};

// Named export — ESLint happy!
export default klaroConfig;