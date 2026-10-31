import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Stripe from "stripe";

const checkSeatsAvailability = async (showId, selectedSeats) => {
  const showData = await Show.findById(showId);
  if (!showData) return false;
  return !selectedSeats.some((seat) => showData.occupiedSeats?.[seat]);
};

export const createBooking = async (req, res) => {
  let booking;
  let showData;
  let userId;

  try {
    userId = req.auth().userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Please sign in to book tickets." });
    }

    const { showId, selectedSeats } = req.body;
    if (!showId || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({ success: false, message: "A show and at least one seat are required." });
    }
    if (selectedSeats.length > 5 || new Set(selectedSeats).size !== selectedSeats.length) {
      return res.status(400).json({ success: false, message: "Select between 1 and 5 unique seats." });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ success: false, message: "Stripe is not configured on the server." });
    }

    showData = await Show.findById(showId).populate("movie");
    if (!showData || !showData.movie) {
      return res.status(404).json({ success: false, message: "Show or movie not found." });
    }

    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
    if (!isAvailable) {
      return res.status(409).json({ success: false, message: "One or more selected seats are no longer available. Please refresh and choose again." });
    }

    booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });

    selectedSeats.forEach((seat) => { showData.occupiedSeats[seat] = userId; });
    showData.markModified("occupiedSeats");
    await showData.save();

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = req.headers.origin || process.env.FRONTEND_URL;
    if (!origin) throw new Error("FRONTEND_URL is missing from server environment variables.");

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/my-bookings?payment=success`,
      cancel_url: `${origin}/my-bookings?payment=cancelled`,
      line_items: [{
        price_data: {
          currency: "inr",
          product_data: { name: showData.movie.title },
          unit_amount: Math.round(booking.amount * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      metadata: { bookingId: booking._id.toString() },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    booking.paymentLink = session.url;
    await booking.save();

    // Booking and payment session are already created; reminder scheduling must not cancel checkout.
    try {
      await inngest.send({
        name: "app/checkpayment",
        data: { bookingId: booking._id.toString() },
      });
    } catch (inngestError) {
      console.error("Could not schedule unpaid-booking cleanup:", inngestError.message);
    }

    return res.status(201).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Create booking failed:", error);

    // If checkout creation failed, undo the unpaid booking and release its seats.
    if (booking && showData) {
      try {
        booking.bookedSeats.forEach((seat) => {
          if (showData.occupiedSeats?.[seat] === userId) {
            delete showData.occupiedSeats[seat];
          }
        });
        showData.markModified("occupiedSeats");
        await showData.save();
        await Booking.findByIdAndDelete(booking._id);
      } catch (rollbackError) {
        console.error("Booking rollback failed:", rollbackError.message);
      }
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const showData = await Show.findById(req.params.showId);
    if (!showData) {
      return res.status(404).json({ success: false, message: "Show not found." });
    }
    return res.json({ success: true, occupiedSeats: Object.keys(showData.occupiedSeats || {}) });
  } catch (error) {
    console.error("Get occupied seats failed:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
