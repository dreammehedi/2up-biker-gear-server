import { model, Schema } from "mongoose";

const EmailConfigurationSchema = new Schema(
  {
    emailMailer: { type: String, required: [true, "Email mailer required!"] },
    emailHost: { type: String, required: [true, "Email host required!"] },
    emailPort: { type: Number, required: [true, "Email port required!"] },
    emailUserName: {
      type: String,
      required: [true, "Email username required!"],
    },
    emailPassword: {
      type: String,
      required: [true, "Email password required!"],
    },
    emailEncryption: {
      type: String,
      required: [true, "Email encryption required!"],
    },
    emailFromName: {
      type: String,
      required: [true, "Email from name required!"],
    },
    emailAddress: { type: String, required: [true, "Email address required!"] },
  },
  { timestamps: true }
);

const EmailConfiguration = model(
  "EmailConfiguration",
  EmailConfigurationSchema,
  "EmailConfiguration"
);

export default EmailConfiguration;
