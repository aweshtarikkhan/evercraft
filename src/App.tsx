import { useState, useEffect, useRef, useCallback, useLayoutEffect, FC } from "react";
import { Routes, Route, Link, useNavigate, useLocation, useParams, } from "react-router-dom";
import { Page, Book, CartItem, User } from "./types";
import { SOCIAL_LINKS } from "./constants/data"; 
import { uploadImageToCloudinary } from "./utils/cloudinary";
import { BookCoverSVG, Logo, Toast, NewsletterSection } from "./components/common/UIComponents";
import { useState, useEffect, useRef, useCallback, useLayoutEffect, FC } from "react";
import { Routes, Route, Link, useNavigate, useLocation, useParams, } from "react-router-dom";
import { Page, Book, CartItem, User } from "./types";
import { SOCIAL_LINKS } from "./constants/data"; 
import { uploadImageToCloudinary } from "./utils/cloudinary";
import { BookCoverSVG, Logo, Toast, NewsletterSection } from "./components/common/UIComponents";
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { BookPage } from "./pages/BookPage";

import { ServicesPage } from "./pages/ServicesPage";
import { AboutPage } from "./pages/AboutPage";
import { PublishPage } from "./pages/PublishPage";
import { ContactPage } from "./pages/ContactPage";
import { CartPage } from "./pages/CartPage";
import { AdminPanel } from "./pages/AdminPanel";
import { Footer } from "./components/layout/Footer";
import { ServiceDetailPage } from "./pages/ServiceDetailPage";
import { FreeReaderPage } from "./pages/FreeReaderPage";
import { PrivacyPolicyPage, TermsConditionsPage, RefundPolicyPage } from "./pages/Policies";
import { supabase } from "./utils/supabase";
      {!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/read') && showCookieConsent && <CookieConsentPopup onConsent={handleCookieConsent} />}
      {dashboardOpen && currentUser && <UserDashboardModal tab={dashboardTab} currentUser={currentUser} setCurrentUser={setCurrentUser} onClose={() => setDashboardOpen(false)} showToast={setToast} />}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} showToast={setToast} go={go} setCurrentUser={setCurrentUser} />}
      {!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/read') && newsletterPopupOpen && currentUser && (
        <NewsletterPopup 
          user={currentUser} 
          onClose={() => {
            setNewsletterPopupOpen(false);
            sessionStorage.setItem('evercraft_newsletter_closed', 'true');
          }} 
          showToast={setToast} 
        />
      )}
      <div className="toast-wrapper-top-center">
        {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
        .toast-wrapper-top-center > div {
          position: fixed !important;
          bottom: auto !important;
          top: 24px !important;
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%) !important;
          margin: 0 !important;
          z-index: 999999 !important;
        }
      `}</style>
    </div>
  );
}