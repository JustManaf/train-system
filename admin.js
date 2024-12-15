import supabase from "../config/db.js";

const assignStaffToTrain = async (req, res) => {
  const { train_id, staff_id, date } = req.body;
  const { data, error } = await supabase
    .from("trainassignment")
    .upsert([{ train_id, staff_id, date }])
    .select();

  if (error) return res.status(500).json(error);
  res.status(200).json(data);
};
// Staff/Admin: Add/Edit/Cancel Reservations
const upsertReservation = async (req, res) => {
  // update is based on status {pending, confirmed, cancelled  }. or insert a new record.
  const {
    passenger_id,
    schedule_id,
    coach_type,
    seat_number,
    luggage_details,
    status,
  } = req.body;
  const { data, error } = await supabase.from("Reservation").upsert([
    {
      passenger_id,
      schedule_id,
      coach_type,
      seat_number,
      luggage_details,
      status,
    },
  ]);

  if (error) return res.status(500).json(error);
  res.status(200).json(data);
};
// Staff/Admin: Promote Waitlisted Passenger
// app.post('/promote-waitlist', async (req, res) => {
//   const { reservation_id } = req.body;
//   const { data, error } = await supabase
//     .from('WaitingList')
//     .update({ status: 'active' })
//     .match({ reservation_id, status: 'active' });

//   if (error) return res.status(500).json(error);
//   res.status(200).json(data);
// });
export { assignStaffToTrain, upsertReservation };
