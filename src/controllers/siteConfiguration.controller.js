import {
  ContactFeedback,
  ContactInformation,
  FbGaGtmConfig,
  LogoAndFavicon,
  ReservationFeedback,
  SeoConfig,
  SiteConfig,
  SocialNetworks,
  StripePaymentConfig,
  SubscriptionFeedback,
} from "../models/siteConfiguration.model.js";

import cloudinary from "../config/cloudinary.config.js";

import Blog from "../models/blog.model.js";
import {
  BlogCategory,
  ProductCategory,
  ProductSubCategory,
} from "../models/Category.model.js";
import ContactUser from "../models/contact.model.js";
import { Coupon } from "../models/coupon.model.js";
import Order from "../models/Order.model.js";
import Product from "../models/product.model.js";

const getSiteOverviewData = async (req, res) => {
  try {
    const productCategories = await ProductCategory.countDocuments();
    const productSubCategories = await ProductSubCategory.countDocuments();
    const blogCategories = await BlogCategory.countDocuments();
    const coupon = await Coupon.countDocuments();
    const product = await Product.countDocuments();
    const blog = await Blog.countDocuments();
    const order = await Order.countDocuments();
    const customerSupport = await ContactUser.countDocuments();

    const data = {
      productCategories,
      productSubCategories,
      blogCategories,
      coupon,
      product,
      blog,
      order,
      customerSupport,
    };

    res.status(200).json({
      success: true,
      message: "Site overview data was successfully retrieved.",
      payload: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getData = async (req, res) => {
  try {
    const data = await SiteConfig.find();

    res.status(200).json({
      success: true,
      message: "Site configuration data was successfully retrieved.",
      payload: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateData = async (req, res) => {
  try {
    const { id, title, description, copyRights } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid site configuration ID!",
      });
    }

    // Fetch the current site configuration data
    const data = await SiteConfig.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Site configuration not found!",
      });
    }

    // Update the database with the new fields
    await SiteConfig.findByIdAndUpdate(
      id,
      { title, description, copyRights },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Site configuration updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while updating the site configuration.",
    });
  }
};

const getSeoData = async (req, res) => {
  try {
    const { page_key } = req.params;
    const data = await SeoConfig.findOne({ page_key });

    res.status(200).json({
      success: true,
      message: "Seo configuration data was successfully retrieved.",
      payload: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSeoData = async (req, res) => {
  try {
    const { page_key, ...rest } = req.body;

    if (!page_key) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 'page_key'.",
      });
    }

    // Check if configuration exists for this page_key
    const existing = await SeoConfig.findOne({ page_key });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "No SEO configuration found for the provided page_key.",
      });
    }

    // Update SEO config by page_key
    const updated = await SeoConfig.findOneAndUpdate(
      { page_key },
      { ...rest },
      { new: true, runValidators: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "SEO configuration updated successfully.",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while updating the SEO configuration.",
    });
  }
};

// contact information data
const getContactInformationData = async (req, res) => {
  try {
    const data = await ContactInformation.find();

    res.status(200).json({
      success: true,
      message: "Contact information data was successfully retrieved.",
      payload: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateContactInformationData = async (req, res) => {
  try {
    const { id, phoneNumber, googleApiKey, email, address } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid ID!",
      });
    }

    const data = await ContactInformation.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Contact information not found!",
      });
    }

    // Update the database with the new fields
    await ContactInformation.findByIdAndUpdate(
      id,
      {
        phoneNumber: phoneNumber || "",
        googleApiKey: googleApiKey || "",
        email,
        address: address || "",
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Contact information updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while updating the contact information.",
    });
  }
};

// social networks data
const getSocialNetworksData = async (req, res) => {
  try {
    const data = await SocialNetworks.find();

    res.status(200).json({
      success: true,
      message: "Social networks data was successfully retrieved.",
      payload: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSocialNetworksData = async (req, res) => {
  try {
    const {
      id,
      facebookLink,
      linkedinLink,
      instagramLink,
      twitterLink,
      youtubeLink,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid ID!",
      });
    }

    const data = await SocialNetworks.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Social networks not found!",
      });
    }

    // Update the database with the new fields
    await SocialNetworks.findByIdAndUpdate(
      id,
      {
        facebookLink,
        linkedinLink,
        instagramLink: instagramLink || "",
        twitterLink: twitterLink || "",
        youtubeLink,
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Social networks updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while updating the social networks.",
    });
  }
};

// logo and favicon data
const getLogoAndFaviconData = async (req, res) => {
  try {
    const data = await LogoAndFavicon.find();

    res.status(200).json({
      success: true,
      message: "Logo and Favicon data was successfully retrieved.",
      payload: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addLogoAndFaviconData = async (req, res) => {
  try {
    const cloudinaryResult = req.files;
    const logoFile = cloudinaryResult.logo ? cloudinaryResult.logo[0] : null;
    const footerLogoFile = cloudinaryResult.footerLogo
      ? cloudinaryResult.footerLogo[0]
      : null;
    const faviconFile = cloudinaryResult.favicon
      ? cloudinaryResult.favicon[0]
      : null;

    if (!logoFile || !faviconFile || !footerLogoFile) {
      return res.status(400).json({
        success: false,
        message: "logo, footer logo and favicon files are required.",
      });
    }

    const newData = new LogoAndFavicon({
      favicon: faviconFile.path,
      faviconPublicId: faviconFile.filename,
      logo: logoFile.path,
      logoPublicId: logoFile.filename,
      footerLogo: logoFile.path,
      footerLogoPublicId: logoFile.filename,
    });
    // Save to database
    await newData.save();

    res.status(201).json({
      success: true,
      message: "Data added successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add data!",
    });
  }
};

const updateLogoAndFaviconData = async (req, res) => {
  try {
    const { id, logo, footerLogo, favicon } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid ID!",
      });
    }

    const data = await LogoAndFavicon.findById(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found!",
      });
    }

    let updatedFields = { logo, footerLogo, favicon };

    if (req.files) {
      try {
        const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg"];
        const filesToCheck = [
          { key: "logo", file: req.files.logo?.[0] },
          { key: "footerLogo", file: req.files.footerLogo?.[0] },
          { key: "favicon", file: req.files.favicon?.[0] },
        ];

        for (const { key, file } of filesToCheck) {
          if (file && !allowedMimeTypes.includes(file.mimetype)) {
            return res.status(400).json({
              success: false,
              message: `Only PNG and JPG files are allowed for ${key}.`,
            });
          }
        }

        const logoFile = req.files.logo?.[0] || null;
        const footerLogoFile = req.files.footerLogo?.[0] || null;
        const faviconFile = req.files.favicon?.[0] || null;

        if (footerLogoFile) {
          if (data.footerLogoPublicId) {
            await cloudinary.uploader.destroy(data.footerLogoPublicId);
          }
          updatedFields.footerLogo = footerLogoFile.path;
          updatedFields.footerLogoPublicId = footerLogoFile.filename;
        }

        if (logoFile) {
          if (data.logoPublicId) {
            await cloudinary.uploader.destroy(data.logoPublicId);
          }
          updatedFields.logo = logoFile.path;
          updatedFields.logoPublicId = logoFile.filename;
        }

        if (faviconFile) {
          if (data.faviconPublicId) {
            await cloudinary.uploader.destroy(data.faviconPublicId);
          }
          updatedFields.favicon = faviconFile.path;
          updatedFields.faviconPublicId = faviconFile.filename;
        }
      } catch (imageError) {
        return res.status(500).json({
          success: false,
          message: "File upload failed.",
          error: imageError.message,
        });
      }
    }

    const updatedData = await LogoAndFavicon.findByIdAndUpdate(
      id,
      updatedFields,
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Data updated successfully.",
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while updating the data!",
    });
  }
};

// stripe config data
const getStripeConfigData = async (req, res) => {
  try {
    const data = await StripePaymentConfig.find();

    res.status(200).json({
      success: true,
      message: "Stripe config data was successfully retrieved.",
      payload: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStripeConfigData = async (req, res) => {
  try {
    const { id, stripeKey, stripeSecret, stripeMethod } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid ID!",
      });
    }

    const data = await StripePaymentConfig.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Stripe config not found!",
      });
    }

    // Update the database with the new fields
    await StripePaymentConfig.findByIdAndUpdate(
      id,
      { stripeKey, stripeSecret, stripeMethod },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Stripe config updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message || "An error occurred while updating the stripe config.",
    });
  }
};

const getReservationFeedback = async (req, res) => {
  try {
    const data = await ReservationFeedback.find();

    res.status(200).json({
      success: true,
      message: "Data was successfully retrieved.",
      payload: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateReservationFeedback = async (req, res) => {
  try {
    const { id, subject, body } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid ID!",
      });
    }

    const data = await ReservationFeedback.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found!",
      });
    }

    // Update the database with the new fields
    await ReservationFeedback.findByIdAndUpdate(
      id,
      { subject, body },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Data updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while updating the data.",
    });
  }
};

const getSubscribeFeedback = async (req, res) => {
  try {
    const data = await SubscriptionFeedback.find();

    res.status(200).json({
      success: true,
      message: "Data was successfully retrieved.",
      payload: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSubscribeFeedback = async (req, res) => {
  try {
    const { id, subject, body } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid ID!",
      });
    }

    const data = await SubscriptionFeedback.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found!",
      });
    }

    // Update the database with the new fields
    await SubscriptionFeedback.findByIdAndUpdate(
      id,
      { subject, body },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Data updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while updating the data.",
    });
  }
};

const getContactFeedback = async (req, res) => {
  try {
    const data = await ContactFeedback.find();

    res.status(200).json({
      success: true,
      message: "Data was successfully retrieved.",
      payload: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateContactFeedback = async (req, res) => {
  try {
    const { id, subject, body } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid ID!",
      });
    }

    const data = await ContactFeedback.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found!",
      });
    }

    // Update the database with the new fields
    await ContactFeedback.findByIdAndUpdate(
      id,
      { subject, body },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Data updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while updating the data.",
    });
  }
};

const getFbGaGtmData = async (req, res) => {
  try {
    const data = await FbGaGtmConfig.find();

    res.status(200).json({
      success: true,
      message: "Data was successfully retrieved.",
      payload: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFbGaGtmData = async (req, res) => {
  try {
    const { id, gtmId, gaId, fbId } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid ID!",
      });
    }

    const data = await FbGaGtmConfig.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found!",
      });
    }

    // Update the database with the new fields
    await FbGaGtmConfig.findByIdAndUpdate(
      id,
      { gtmId, gaId, fbId },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Data updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while updating the data.",
    });
  }
};
export {
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
};
