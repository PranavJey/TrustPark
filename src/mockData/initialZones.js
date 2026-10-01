export const INITIAL_ZONES = [
  {
    id: "zone-101",
    name: "McAllister St Curb - North Segment 101",
    type: "curb_segment",
    address: "350 McAllister St (between Van Ness & Polk)",
    center: [37.7758, -122.4188],
    geometry: [
      [37.7761, -122.4200],
      [37.7756, -122.4178]
    ],
    totalCapacity: 12,
    pricePerHour: 2.75,
    maxDurationHours: 2,
    operatingHours: "08:00 - 18:00 Mon-Sat",
    restrictions: [
      { id: "r1", type: "metered", label: "Pay at station or app", active: true },
      { id: "r2", type: "time_limit", label: "2 Hour Limit enforce 8am-6pm", active: true },
      { id: "r3", type: "street_sweep", label: "No Parking Tue 02:00-05:00", active: false }
    ],
    accessibleSpaces: 1,
    evCharging: false,
    baseHistoricalProbability: 0.85,
    lastVerifiedSecondsAgo: 45,
    lastVerifiedUser: "Alex Rivera (Verified)",
    conflictLevel: 0.05,
    reportsHistory: [
      {
        id: "rep-101-1",
        event: "free",
        timestamp: new Date(Date.now() - 45 * 1000).toISOString(),
        userId: "user-alpha-99",
        userName: "Alex Rivera",
        userTrust: 0.94,
        confidence: 0.95,
        locationAccuracyMeters: 8,
        note: "Parked out, 2 parallel spots open near corner"
      },
      {
        id: "rep-101-2",
        event: "free",
        timestamp: new Date(Date.now() - 320 * 1000).toISOString(),
        userId: "user-beta-42",
        userName: "Elena Rostova",
        userTrust: 0.88,
        confidence: 0.90,
        locationAccuracyMeters: 12,
        note: "Meters active, plenty space"
      }
    ],
    distanceMeters: 110,
    walkTimeMinutes: 1.5,
    predictedVacanciesIn10Min: 3
  },
  {
    id: "zone-102",
    name: "Polk St Commerce Curb - West Segment 102",
    type: "curb_segment",
    address: "620 Polk St (nr Golden Gate Ave)",
    center: [37.7772, -122.4170],
    geometry: [
      [37.7780, -122.4172],
      [37.7765, -122.4168]
    ],
    totalCapacity: 8,
    pricePerHour: 3.50,
    maxDurationHours: 1,
    operatingHours: "07:00 - 19:00 Mon-Sun",
    restrictions: [
      { id: "r1", type: "loading", label: "Yellow Loading Zone until 11am", active: false },
      { id: "r2", type: "time_limit", label: "Strict 1 Hour Limit", active: true }
    ],
    accessibleSpaces: 1,
    evCharging: false,
    baseHistoricalProbability: 0.45,
    lastVerifiedSecondsAgo: 120,
    lastVerifiedUser: "Sam Chen (New Driver)",
    conflictLevel: 0.68, // Contradictory report present!
    reportsHistory: [
      {
        id: "rep-102-1",
        event: "occupied",
        timestamp: new Date(Date.now() - 120 * 1000).toISOString(),
        userId: "user-beta-42",
        userName: "Elena Rostova",
        userTrust: 0.88,
        confidence: 0.85,
        locationAccuracyMeters: 5,
        note: "Delivery truck double parked, full"
      },
      {
        id: "rep-102-2",
        event: "free",
        timestamp: new Date(Date.now() - 210 * 1000).toISOString(),
        userId: "user-delta-77",
        userName: "SpamBot_3000",
        userTrust: 0.22,
        confidence: 0.30,
        locationAccuracyMeters: 45,
        note: "Completely empty space"
      }
    ],
    distanceMeters: 80,
    walkTimeMinutes: 1.0,
    predictedVacanciesIn10Min: 1
  },
  {
    id: "zone-103",
    name: "Civic Center Underground Garage",
    type: "garage",
    address: "355 McAllister St Underground",
    center: [37.7752, -122.4175],
    geometry: [
      [37.7755, -122.4182],
      [37.7755, -122.4168],
      [37.7748, -122.4168],
      [37.7748, -122.4182]
    ],
    totalCapacity: 350,
    pricePerHour: 4.50,
    maxDurationHours: 12,
    operatingHours: "24/7 Multi-level Garage",
    restrictions: [
      { id: "r1", type: "height_limit", label: "Height Clearance 6'8\"", active: true },
      { id: "r2", type: "ev_priority", label: "12 EV Charging Bays Level 1", active: true }
    ],
    accessibleSpaces: 14,
    evCharging: true,
    baseHistoricalProbability: 0.92,
    lastVerifiedSecondsAgo: 850, // Older verification
    lastVerifiedUser: "City Automated Feed API",
    conflictLevel: 0.0,
    reportsHistory: [
      {
        id: "rep-103-1",
        event: "free",
        timestamp: new Date(Date.now() - 850 * 1000).toISOString(),
        userId: "system-feed",
        userName: "Municipal Gate API",
        userTrust: 0.90,
        confidence: 0.88,
        locationAccuracyMeters: 0,
        note: "Level 2 has 42 vacant stalls"
      }
    ],
    distanceMeters: 160,
    walkTimeMinutes: 2.0,
    predictedVacanciesIn10Min: 8
  },
  {
    id: "zone-104",
    name: "Larkin St Resident Curb - Segment 104",
    type: "curb_segment",
    address: "410 Larkin St (nr Fulton St)",
    center: [37.7781, -122.4160],
    geometry: [
      [37.7788, -122.4163],
      [37.7774, -122.4157]
    ],
    totalCapacity: 10,
    pricePerHour: 1.50,
    maxDurationHours: 4,
    operatingHours: "09:00 - 18:00 Mon-Fri",
    restrictions: [
      { id: "r1", type: "permit_required", label: "Permit Area J Required after 18:00", active: true },
      { id: "r2", type: "time_limit", label: "2h limit for non-permit holders", active: true }
    ],
    accessibleSpaces: 0,
    evCharging: false,
    baseHistoricalProbability: 0.78,
    lastVerifiedSecondsAgo: 1400, // Stale!
    lastVerifiedUser: "Sam Chen (New Driver)",
    conflictLevel: 0.1,
    reportsHistory: [
      {
        id: "rep-104-1",
        event: "free",
        timestamp: new Date(Date.now() - 1400 * 1000).toISOString(),
        userId: "user-gamma-12",
        userName: "Sam Chen",
        userTrust: 0.62,
        confidence: 0.60,
        locationAccuracyMeters: 15,
        note: "Spotted free spot near tree"
      }
    ],
    distanceMeters: 220,
    walkTimeMinutes: 3.0,
    predictedVacanciesIn10Min: 2
  },
  {
    id: "zone-105",
    name: "Golden Gate Ave Commercial Surface Lot",
    type: "surface_lot",
    address: "150 Golden Gate Ave",
    center: [37.7812, -122.4148],
    geometry: [
      [37.7816, -122.4152],
      [37.7816, -122.4144],
      [37.7808, -122.4144],
      [37.7808, -122.4152]
    ],
    totalCapacity: 45,
    pricePerHour: 5.00,
    maxDurationHours: 8,
    operatingHours: "06:00 - 22:00 Daily",
    restrictions: [
      { id: "r1", type: "pay_by_app", label: "Prepay ParkMobile Zone 409", active: true }
    ],
    accessibleSpaces: 3,
    evCharging: true,
    baseHistoricalProbability: 0.95,
    lastVerifiedSecondsAgo: 38,
    lastVerifiedUser: "Alex Rivera (Verified)",
    conflictLevel: 0.02,
    reportsHistory: [
      {
        id: "rep-105-1",
        event: "free",
        timestamp: new Date(Date.now() - 38 * 1000).toISOString(),
        userId: "user-alpha-99",
        userName: "Alex Rivera",
        userTrust: 0.94,
        confidence: 0.98,
        locationAccuracyMeters: 4,
        note: "Surface lot has ~12 open spaces in back row"
      }
    ],
    distanceMeters: 290,
    walkTimeMinutes: 3.8,
    predictedVacanciesIn10Min: 5
  },
  {
    id: "zone-106",
    name: "Fulton St Express Loading Curb 106",
    type: "curb_segment",
    address: "201 Fulton St (nr Asian Art Museum)",
    center: [37.7794, -122.4178],
    geometry: [
      [37.7800, -122.4182],
      [37.7788, -122.4174]
    ],
    totalCapacity: 6,
    pricePerHour: 0.00,
    maxDurationHours: 0.5,
    operatingHours: "07:00 - 16:00 Loading Only",
    restrictions: [
      { id: "r1", type: "commercial_only", label: "Commercial Loading Only (15 Min)", active: true },
      { id: "r2", type: "tow_away", label: "Tow Away Zone after 16:00", active: false }
    ],
    accessibleSpaces: 1,
    evCharging: false,
    baseHistoricalProbability: 0.30,
    lastVerifiedSecondsAgo: 90,
    lastVerifiedUser: "Elena Rostova",
    conflictLevel: 0.85, // High restriction conflict for general public!
    reportsHistory: [
      {
        id: "rep-106-1",
        event: "blocked",
        timestamp: new Date(Date.now() - 90 * 1000).toISOString(),
        userId: "user-beta-42",
        userName: "Elena Rostova",
        userTrust: 0.88,
        confidence: 0.90,
        locationAccuracyMeters: 6,
        note: "Commercial loading active, non-commercial cars ticketed"
      }
    ],
    distanceMeters: 140,
    walkTimeMinutes: 1.8,
    predictedVacanciesIn10Min: 0
  }
];
