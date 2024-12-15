import supabase from "../config/db.js";

// Report: Active trains for today
const activeTrains = async (req, res) => {
  const today = new Date().toISOString();
  console.log(today);
  const { data, error } = await supabase
    .from("schedule")
    .select("*") // Select all columns
    .gt("departure_time", today)
    .select();

  if (error) return res.status(500).json(error);
  res.status(200).json(data);
};

// Report: List stations for each train
const stationsForTrain = async (req, res) => {
  // Step 1: Fetch all trains with their track_id
  const { data: trains, error: trainsError } = await supabase
    .from("train")
    .select("train_id, track_id, name_ar, name_eng"); // Including additional train details

  if (trainsError) {
    console.error("Error fetching trains:", trainsError);
    return res.status(500).json({ error: "Error fetching trains" });
  }

  if (!trains || trains.length === 0) {
    console.warn("No trains found");
    return res.status(404).json({ message: "No trains found" });
  }

  const stationsForTrains = [];

  // Step 2: Fetch stations for each train by its track_id
  for (const train of trains) {
    const { track_id } = train;

    // Get stations associated with the track_id
    const { data: stationData, error: stationError } = await supabase
      .from("station")
      .select("station_name")
      .eq("track_id", track_id);

    if (stationError) {
      console.error("Error fetching stations:", stationError);
      return res.status(500).json({ error: "Error fetching stations" });
    }

    if (!stationData || stationData.length === 0) {
      console.warn(`No stations found for track_id ${track_id}`);
      continue; // Skip if no stations are found for this track
    }

    // Add the train and its associated stations to the result
    stationsForTrains.push({
      train_id: train.train_id,
      track_id: train.track_id,
      name_ar: train.name_ar,
      name_eng: train.name_eng,
      stations: stationData.map((station) => station.station_name),
    });
  }

  // Step 3: Return the result
  res.status(200).json(stationsForTrains);
};
// Report: Reservation details for a given passenger ID
const reservationDetails = async (req, res) => {
  const { passengerId } = req.body;
  try {
    const { data, error } = await supabase
      .from("reservation")
      .select("*")
      .eq("passenger_id", passengerId)
      .select();

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reservation details" });
  }
};

// // Report: Waitlisted loyalty passengers for each class given a train number
// const waitlistedLoyaltyPassengers = async (req, res) => {
//   const { trainId } = req.params;
//   try {
//     const { data, error } = await supabase
//       .from("Reservation")
//       .select("passenger_id, status, loyalty_id")
//       .eq("status", "waitlisted")
//       .eq("train_id", trainId);

//     if (error) throw error;

//     const loyaltyData = await Promise.all(
//       data.map(async (reservation) => {
//         const loyalty = await supabase
//           .from("LoyaltyProgram")
//           .select("tier")
//           .eq("loyalty_id", reservation.loyalty_id)
//           .single();
//         return {
//           passenger_id: reservation.passenger_id,
//           tier: loyalty.data.tier,
//         };
//       })
//     );

//     res.status(200).json(loyaltyData);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error fetching waitlisted loyalty passengers" });
//   }
// };

export { activeTrains, stationsForTrain, reservationDetails };
