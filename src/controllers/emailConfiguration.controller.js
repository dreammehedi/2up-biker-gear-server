import encrypt from "../helper/encrypt.js";
import EmailConfiguration from "../models/emailConfigurationModal.js";

const getEmailConfiguration = async (req, res) => {
  try {
    const emailConfiguration = await EmailConfiguration.find();

    res.status(200).json({
      success: true,
      message: "Email configuration data was successfully retrieved.",
      payload: emailConfiguration,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEmailConfiguration = async (req, res) => {
  try {
    const { id, emailPassword, ...otherFields } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email configuration ID!",
      });
    }

    // if (emailPassword.length < 16) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Please provide a valid 16-character email password!",
    //   });
    // }

    // Fetch the current email configuration data
    const emailConfiguration = await EmailConfiguration.findById(id);

    if (!emailConfiguration) {
      return res.status(404).json({
        success: false,
        message: "Email configuration not found!",
      });
    }

    const updatedFields = { ...otherFields };

    // Encrypt the password

    if (emailPassword) {
      const encryptedPassword = encrypt(emailPassword);
      updatedFields.emailPassword = encryptedPassword;
    }

    // Update the database with the new fields
    await EmailConfiguration.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Email configuration updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while updating the email configuration.",
    });
  }
};

export { getEmailConfiguration, updateEmailConfiguration };
