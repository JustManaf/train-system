const searchTrains = async (req, res) => {
  try {
    // Extract values from the request body
    const { fromStationId, toStationId, departureTime } = req.body;

    // Input validation to ensure required fields are provided
    if (!fromStationId || !toStationId || !departureTime) {
      return res.status(400).json({
        message: "fromStationId, toStationId, and departureTime are required.",
      });
    }

    // Get the current time (in UTC format) for comparison with departure_time
    const currentTime = new Date().toISOString(); // ISO format timestamp

    // Query to fetch schedule details with related Train, StartStation, and StopStation details
    const { data: scheduleData, error: scheduleError } = await supabase
      .from("Schedule")
      .select(
        `
        schedule_id,
        train_id,
        departure_time,
        arrival_time,
        start_station_id,
        stop_station_id,
        Train:max_seats,                -- Correct way to select max_seats from the related Train table
        StartStation:station_name,      -- Correct way to select station_name from the related StartStation table
        StopStation:station_name
    `
      )
      .eq("start_station_id", fromStationId) // Filter by start station ID
      .eq("stop_station_id", toStationId) // Filter by stop station ID
      .gte("departure_time", currentTime) // Filter future departures
      .order("departure_time", { ascending: true }); // Sort by departure time

    // Handle any errors with the schedule query
    if (scheduleError) {
      console.error("Error fetching schedule:", scheduleError);
      return res.status(500).json({
        message: "Error fetching train schedules",
        error: scheduleError.message,
      });
    }

    // If no schedules found, send a 404 response
    if (!scheduleData || scheduleData.length === 0) {
      return res.status(404).json({
        message: "No trains found for the specified stations and time.",
      });
    }

    // Query to count confirmed reservations for each schedule
    const scheduleIds = scheduleData.map((schedule) => schedule.schedule_id);
    const { data: reservationCounts, error: reservationError } = await supabase
      .from("Reservation")
      .select(
        `
        schedule_id,
        count: count(*)
      `
      )
      .in("schedule_id", scheduleIds) // Filter by schedule IDs
      .eq("status", "confirmed") // Only count confirmed reservations
      .group("schedule_id"); // Group by schedule ID

    // Handle any errors with the reservation query
    if (reservationError) {
      console.error("Error fetching reservation counts:", reservationError);
      return res.status(500).json({
        message: "Error fetching reservation counts",
        error: reservationError.message,
      });
    }

    // Map reservation counts to a dictionary for quick lookup
    const reservationCountsMap = {};
    reservationCounts.forEach((reservation) => {
      reservationCountsMap[reservation.schedule_id] = reservation.count;
    });

    // Process the schedule data to calculate available seats and format the response
    const trainsWithAvailability = scheduleData.map((train) => {
      const {
        schedule_id,
        train_id,
        departure_time,
        Train,
        StartStation,
        StopStation,
      } = train;

      // Get reserved seats from the map or default to 0 if not found
      const reservedSeats = reservationCountsMap[schedule_id] || 0;

      // Calculate available seats
      const availableSeats = Train.max_seats - reservedSeats;

      return {
        schedule_id,
        train_id,
        departure_time,
        from_station_name: StartStation.station_name,
        to_station_name: StopStation.station_name,
        available_seats: availableSeats,
      };
    });

    // Send the response with available train data
    res.status(200).json(trainsWithAvailability);
  } catch (error) {
    // Handle unexpected server errors
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
