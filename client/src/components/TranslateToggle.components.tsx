import React, { useEffect } from 'react';
import { Globe } from 'lucide-react';

export const TranslateToggle: React.FC = () => {
  useEffect(() => {
    // Add Google Translate script only once
    if (!document.getElementById('google-translate-script')) {
      const addScript = document.createElement('script');
      addScript.id = 'google-translate-script';
      addScript.setAttribute(
        'src',
        '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      );
      document.body.appendChild(addScript);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'hi',
            includedLanguages: 'en,hi',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      };
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-zinc-500" />
      <div id="google_translate_element" className="translate-widget-container"></div>
      <style>
        {`
          /* Hide Google Translate top banner */
          .skiptranslate iframe {
            display: none !important;
          }
          body {
            top: 0px !important;
          }
          /* Style the simple layout box */
          .goog-te-gadget-simple {
            border: 1px solid #e4e4e7 !important;
            border-radius: 4px !important;
            padding: 4px 8px !important;
            background-color: white !important;
            display: flex !important;
            align-items: center !important;
            cursor: pointer;
            height: 28px !important;
          }
          /* Hide Google logo inside the translate box */
          .goog-te-gadget-simple img {
            display: none !important;
          }
          /* Style the text inside */
          .goog-te-gadget-simple .goog-te-menu-value {
            color: #3f3f46 !important;
            font-size: 12px !important;
            font-weight: 600 !important;
            display: flex !important;
            align-items: center !important;
            margin: 0 !important;
          }
          /* Hide the pipe separator by removing its border */
          .goog-te-gadget-simple .goog-te-menu-value span {
            border-left: none !important;
          }
          /* Arrow color */
          .goog-te-gadget-simple .goog-te-menu-value span:last-child {
            margin-left: 4px !important;
            color: #71717a !important;
          }
          /* Hide tooltip */
          .goog-tooltip {
            display: none !important;
          }
          .goog-tooltip:hover {
            display: none !important;
          }
          .goog-text-highlight {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
        `}
      </style>
    </div>
  );
};

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}
