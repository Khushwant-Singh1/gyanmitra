'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Globe } from 'lucide-react';

export const TranslateToggle: React.FC = () => {
  const [isActivated, setIsActivated] = useState(false);

  const loadTranslate = useCallback(() => {
    setIsActivated(true);
    if (typeof window === 'undefined') return;
    if (document.getElementById('google-translate-script')) return;

    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'hi',
            includedLanguages: 'en,hi',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    const addScript = document.createElement('script');
    addScript.id = 'google-translate-script';
    addScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(addScript);
  }, []);

  useEffect(() => {
    if (isActivated) {
      loadTranslate();
    }
  }, [isActivated, loadTranslate]);

  return (
    <div
      className="flex items-center gap-1.5 cursor-pointer py-0.5 px-1.5 rounded border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors"
      onPointerEnter={loadTranslate}
      onClick={loadTranslate}
      onTouchStart={loadTranslate}
      title="Translate / भाषा बदलें"
      suppressHydrationWarning
    >
      <Globe className="h-4 w-4 text-zinc-500 shrink-0" />
      <div id="google_translate_element" className="translate-widget-container" suppressHydrationWarning>
        {!isActivated && (
          <span className="text-[11px] font-semibold text-zinc-600 select-none">
            English / हिंदी
          </span>
        )}
      </div>
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
