import ShippingCost from "../models/shippingCost.model.js";

export const checkZipCode = async (req, res) => {
  try {
    const { zipCode } = req.body;

    if (!zipCode) {
      return res.status(400).json({ message: "Zip code is required" });
    }

    const zipCodeNumber = Number(zipCode);

    if (isNaN(zipCodeNumber)) {
      return res.status(400).json({ message: "Zip code must be a number" });
    }

    // console.log(zipCodeNumber, "34001");

    const shippingCost = await ShippingCost.findOne({ zipCode: zipCodeNumber });

    if (!shippingCost) {
      return res
        .status(404)
        .json({ message: "Shipping cost not found for this zip code" });
    }

    return res.status(200).json({
      success: true,
      message: "Shipping cost found",
      payload: shippingCost,
    });
  } catch (error) {
    console.error("Error checking shipping cost:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
