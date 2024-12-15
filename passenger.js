import supabase from "../config/db.js";

async function searchTrains(req, res) {
  const { fromStationId, toStationId, departureTime } = req.body;

  try {
    const { data, error } = await supabase
      .from("schedule")
      .select(
        `
              train_id, 
              start_station_id, 
              stop_station_id, 
              departure_time, 
              arrival_time
          `
      )
      .eq("start_station_id", fromStationId)
      .eq("stop_station_id", toStationId)
      .gte("departure_time", departureTime);

    if (error) return res.status(500).json({ error: error.message });

    if (data.length === 0) {
      return res
        .status(404)
        .json({ message: "No trains available for the given criteria." });
    }

    return res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// {
//   "message": "Reservation successful!",
//   "reservation": {
//       "reservation_id": 26,
//       "passenger_id": 5,
//       "schedule_id": 1,
//       "coach_type": "econmoic",
//       "luggage_details": null,
//       "status": "pending",
//       "created_at": "2024-12-15T01:34:31.410358",
//       "seat_number": 0
//   }
// }
async function bookSeat(req, res) {
  const { passengerId, scheduleId, coachType, seatNumber } = req.body;
  console.log(seatNumber);
  try {
    const { data, error } = await supabase
      .from("reservation")
      .insert({
        passenger_id: passengerId,
        schedule_id: scheduleId,
        coach_type: coachType,
        seat_number: seatNumber,
        status: "pending",
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res
      .status(201)
      .json({ message: "Reservation successful!", reservation: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
async function completePayment(req, res) {
  const { reservationId, paymentMethod, amount } = req.body;

  // Validate required inputs
  if (!reservationId || !paymentMethod || !amount) {
    return res.status(400).json({
      error:
        "Missing required fields: reservationId, paymentMethod, or amount.",
    });
  }

  try {
    // Insert payment record
    const { data: paymentData, error: paymentError } = await supabase
      .from("payment")
      .insert({
        reservation_id: reservationId,
        payment_date: new Date(), // Current date and time
        amount: amount,
        payment_method: paymentMethod,
        payment_status: "paid", // Default status to 'paid'
      })
      .select();

    if (paymentError) {
      console.error("Payment Error:", paymentError.message);
      return res.status(500).json({ error: paymentError.message });
    }

    // Update reservation status based on payment success
    const reservationStatus = paymentData ? "confirmed" : "cancelled";
    const { error: reservationError } = await supabase
      .from("reservation")
      .update({ status: reservationStatus })
      .eq("reservation_id", reservationId);

    if (reservationError) {
      console.error("Reservation Update Error:", reservationError.message);
      return res.status(500).json({ error: reservationError.message });
    }

    // Send response based on payment and reservation status
    if (paymentData) {
      return res.status(200).json({
        message: "Payment successful and reservation confirmed!",
        ticket: {
          reservationId,
          paymentDetails: paymentData[0],
        },
      });
    } else {
      return res.status(400).json({
        error: "Payment failed. Reservation has been cancelled.",
      });
    }
  } catch (err) {
    console.error("Server Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
export { searchTrains, bookSeat, completePayment };
