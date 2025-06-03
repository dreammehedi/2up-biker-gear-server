import express from "express";
import {
  addLogoAndFaviconData,
  getContactFeedback,
  getContactInformationData,
  getData,
  getFbGaGtmData,
  getLogoAndFaviconData,
  getReservationFeedback,
  getSeoData,
  getSiteOverviewData,
  getSocialNetworksData,
  getStripeConfigData,
  getSubscribeFeedback,
  updateContactFeedback,
  updateContactInformationData,
  updateData,
  updateFbGaGtmData,
  updateLogoAndFaviconData,
  updateReservationFeedback,
  updateSeoData,
  updateSocialNetworksData,
  updateStripeConfigData,
  updateSubscribeFeedback,
} from "../controllers/siteConfiguration.controller.js";

import verifyToken from "../middlewares/verifyToken.js";
import { upload } from "../upload/upload.js";

const SiteConfigurationRouter = express.Router();

SiteConfigurationRouter.get("/site-overview", getSiteOverviewData);
SiteConfigurationRouter.get("/site-config", getData);
SiteConfigurationRouter.patch(
  "/update-site-config",
  verifyToken,
  upload.none(),
  updateData
);

SiteConfigurationRouter.get("/seo-config/:page_key", getSeoData);
SiteConfigurationRouter.patch(
  "/update-seo-config",
  verifyToken,
  upload.none(),
  updateSeoData
);

SiteConfigurationRouter.get("/fb-ga-gtm-config", getFbGaGtmData);
SiteConfigurationRouter.patch(
  "/update-fb-ga-gtm-config",
  verifyToken,
  upload.none(),
  updateFbGaGtmData
);

SiteConfigurationRouter.get("/reservation-feedback", getReservationFeedback);
SiteConfigurationRouter.patch(
  "/update-reservation-feedback",
  verifyToken,
  upload.none(),
  updateReservationFeedback
);

SiteConfigurationRouter.get("/contact-feedback", getContactFeedback);
SiteConfigurationRouter.patch(
  "/update-contact-feedback",
  verifyToken,
  upload.none(),
  updateContactFeedback
);

SiteConfigurationRouter.get("/subscribe-feedback", getSubscribeFeedback);
SiteConfigurationRouter.patch(
  "/update-subscribe-feedback",
  verifyToken,
  upload.none(),
  updateSubscribeFeedback
);

SiteConfigurationRouter.get("/contact-information", getContactInformationData);
SiteConfigurationRouter.patch(
  "/update-contact-information",
  verifyToken,
  upload.none(),
  updateContactInformationData
);

SiteConfigurationRouter.get("/social-networks", getSocialNetworksData);
SiteConfigurationRouter.patch(
  "/update-social-networks",

  upload.none(),
  updateSocialNetworksData
);

SiteConfigurationRouter.get(
  "/logo-and-favicon",

  getLogoAndFaviconData
);
SiteConfigurationRouter.post(
  "/add-logo-and-favicon",
  verifyToken,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
    { name: "footerLogo", maxCount: 1 },
  ]),
  addLogoAndFaviconData
);
SiteConfigurationRouter.patch(
  "/update-logo-and-favicon",
  verifyToken,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
    { name: "footerLogo", maxCount: 1 },
  ]),
  updateLogoAndFaviconData
);

SiteConfigurationRouter.get("/stripe-config", getStripeConfigData);
SiteConfigurationRouter.patch(
  "/update-stripe-config",
  verifyToken,
  upload.none(),
  updateStripeConfigData
);

export default SiteConfigurationRouter;
