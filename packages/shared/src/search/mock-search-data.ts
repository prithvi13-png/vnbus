import type {
  BusAmenity,
  BusPoint,
  BusSearchResult,
  BusType,
  GeoPoint,
  RoutePreview,
  SeatLayoutPreview,
} from "@vnbus/types";

export const POPULAR_CITIES = [
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Mumbai",
  "Delhi",
  "Pune",
  "Mysore",
  "Coimbatore",
  "Kochi",
  "Vijayawada",
  "Vizag",
  "Goa",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
] as const;

export const CITY_ALIASES: Record<string, string> = {
  bengaluru: "Bangalore",
  bangalore: "Bangalore",
  mumbai: "Mumbai",
  bombay: "Mumbai",
  vizag: "Vizag",
  visakhapatnam: "Vizag",
};

export const CITY_POINTS: Record<string, GeoPoint> = {
  Bangalore: { city: "Bangalore", latitude: 12.9716, longitude: 77.5946 },
  Hyderabad: { city: "Hyderabad", latitude: 17.385, longitude: 78.4867 },
  Chennai: { city: "Chennai", latitude: 13.0827, longitude: 80.2707 },
  Mumbai: { city: "Mumbai", latitude: 19.076, longitude: 72.8777 },
  Delhi: { city: "Delhi", latitude: 28.6139, longitude: 77.209 },
  Pune: { city: "Pune", latitude: 18.5204, longitude: 73.8567 },
  Mysore: { city: "Mysore", latitude: 12.2958, longitude: 76.6394 },
  Coimbatore: { city: "Coimbatore", latitude: 11.0168, longitude: 76.9558 },
  Kochi: { city: "Kochi", latitude: 9.9312, longitude: 76.2673 },
  Vijayawada: { city: "Vijayawada", latitude: 16.5062, longitude: 80.648 },
  Vizag: { city: "Vizag", latitude: 17.6868, longitude: 83.2185 },
  Goa: { city: "Goa", latitude: 15.2993, longitude: 74.124 },
  Ahmedabad: { city: "Ahmedabad", latitude: 23.0225, longitude: 72.5714 },
  Jaipur: { city: "Jaipur", latitude: 26.9124, longitude: 75.7873 },
  Lucknow: { city: "Lucknow", latitude: 26.8467, longitude: 80.9462 },
};

export const BUS_TYPES: BusType[] = [
  "AC Sleeper",
  "Non AC Sleeper",
  "Seater",
  "Semi Sleeper",
  "Volvo",
  "Mercedes",
  "Luxury",
  "Electric",
];

export const AMENITIES: BusAmenity[] = [
  "WiFi",
  "Charging Point",
  "Blanket",
  "Water Bottle",
  "GPS",
  "Reading Light",
  "CCTV",
  "Emergency Exit",
  "USB Charger",
  "Live Tracking",
];

export interface MockRoute {
  id: string;
  sourceCity: string;
  destinationCity: string;
  distanceKm: number;
  durationMinutes: number;
  preview: RoutePreview;
}

export interface MockOperator {
  id: string;
  name: string;
  logoUrl: string;
  baseRating: number;
}

export interface MockSearchDatabase {
  popularCities: string[];
  routes: MockRoute[];
  operators: MockOperator[];
  boardingPoints: BusPoint[];
  droppingPoints: BusPoint[];
  buses: BusSearchResult[];
}

const OPERATOR_PREFIXES = [
  "Vriddhi",
  "Nexus",
  "Southern",
  "Western",
  "Eastern",
  "Northern",
  "Sapphire",
  "Royal",
  "GreenLine",
  "Metro",
];

const OPERATOR_SUFFIXES = [
  "Express",
  "Travels",
  "Roadways",
  "Primo",
  "Connect",
  "Voyager",
  "Transit",
  "Lines",
  "Mobility",
  "Cruiser",
];

const POINT_NAMES = [
  "Central Bus Stand",
  "Railway Station",
  "Airport Road",
  "City Junction",
  "Market Circle",
  "Tech Park Gate",
  "Ring Road",
  "Bypass Toll",
  "Metro Station",
  "Old Bus Depot",
];

const REVIEW_TAGS = [
  "Clean coach",
  "On-time pickup",
  "Helpful staff",
  "Comfortable seats",
  "Smooth ride",
  "Good halt",
  "Safe driving",
  "Fresh blankets",
];

const BUS_IMAGE_COLORS = ["0f766e", "1d4ed8", "7c3aed", "b45309", "be123c", "047857"];

export const mockSearchDatabase = createMockSearchDatabase();

export function normalizeCity(value: string): string {
  const normalized = value.trim().toLowerCase();

  return CITY_ALIASES[normalized] ?? toTitleCase(value.trim());
}

export function getMockSupplierTrips({
  destinationCity,
  journeyDate,
  passengerCount,
  sourceCity,
}: {
  sourceCity: string;
  destinationCity: string;
  journeyDate: string;
  passengerCount: number;
}): BusSearchResult[] {
  const source = normalizeCity(sourceCity);
  const destination = normalizeCity(destinationCity);

  return mockSearchDatabase.buses
    .filter(
      (bus) =>
        bus.sourceCity === source &&
        bus.destinationCity === destination &&
        bus.availableSeats >= passengerCount,
    )
    .map((bus) => applyJourneyDate(bus, journeyDate));
}

export function getPopularRoutes(limit = 12): MockRoute[] {
  return [...mockSearchDatabase.routes]
    .sort((left, right) => right.distanceKm - left.distanceKm)
    .slice(0, limit);
}

export function getMockTripById(tripId: string, journeyDate: string): BusSearchResult | null {
  const trip = mockSearchDatabase.buses.find((bus) => bus.tripId === tripId);

  return trip ? applyJourneyDate(trip, journeyDate) : null;
}

function createMockSearchDatabase(): MockSearchDatabase {
  const routes = createRoutes();
  const operators = createOperators();
  const boardingPoints = routes.flatMap((route, routeIndex) =>
    createPoints(route, route.sourceCity, "boarding", routeIndex),
  );
  const droppingPoints = routes.flatMap((route, routeIndex) =>
    createPoints(route, route.destinationCity, "dropping", routeIndex),
  );
  const buses = routes.flatMap((route, routeIndex) =>
    Array.from({ length: 5 }, (_, busIndex) =>
      createBus({
        boardingPoints: boardingPoints.slice(routeIndex * 5, routeIndex * 5 + 5),
        busIndex,
        droppingPoints: droppingPoints.slice(routeIndex * 5, routeIndex * 5 + 5),
        operators,
        route,
        routeIndex,
      }),
    ),
  );

  return {
    popularCities: [...POPULAR_CITIES],
    routes,
    operators,
    boardingPoints,
    droppingPoints,
    buses,
  };
}

function createRoutes(): MockRoute[] {
  const routePairs: Array<[string, string]> = [];
  const cities = [...POPULAR_CITIES];

  for (const source of cities) {
    for (const destination of cities) {
      if (source !== destination && routePairs.length < 100) {
        routePairs.push([source, destination]);
      }
    }
  }

  return routePairs.map(([sourceCity, destinationCity], index) => {
    const source = getCityPoint(sourceCity);
    const destination = getCityPoint(destinationCity);
    const distanceKm = Math.max(72, Math.round(calculateDistanceKm(source, destination)));
    const durationMinutes = Math.round(distanceKm * 1.28 + 95 + (index % 7) * 12);

    return {
      id: `route-${String(index + 1).padStart(3, "0")}`,
      sourceCity,
      destinationCity,
      distanceKm,
      durationMinutes,
      preview: createRoutePreview(source, destination, distanceKm),
    };
  });
}

function createOperators(): MockOperator[] {
  return Array.from({ length: 100 }, (_, index) => {
    const prefix = pick(OPERATOR_PREFIXES, index);
    const suffix = pick(OPERATOR_SUFFIXES, Math.floor(index / OPERATOR_PREFIXES.length));
    const name = `${prefix} ${suffix}`;
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("");

    return {
      id: `operator-${String(index + 1).padStart(3, "0")}`,
      name,
      logoUrl: `https://placehold.co/96x96/1d4ed8/ffffff?text=${encodeURIComponent(initials)}`,
      baseRating: roundRating(3.7 + (index % 13) * 0.09),
    };
  });
}

function createPoints(
  route: MockRoute,
  city: string,
  direction: "boarding" | "dropping",
  routeIndex: number,
): BusPoint[] {
  const cityPoint = getCityPoint(city);

  return Array.from({ length: 5 }, (_, index) => {
    const offset = (index - 2) * 0.018;
    const minuteOffset = direction === "boarding" ? index * 12 : route.durationMinutes + index * 10;
    const time = minutesToClock((6 * 60 + (routeIndex % 12) * 75 + minuteOffset) % (24 * 60));

    return {
      id: `${direction}-${route.id}-${index + 1}`,
      name: `${city} ${pick(POINT_NAMES, routeIndex + index)}`,
      city,
      address: `${pick(POINT_NAMES, routeIndex + index)}, ${city}`,
      time,
      latitude: roundCoord(cityPoint.latitude + offset),
      longitude: roundCoord(cityPoint.longitude - offset),
    };
  });
}

function createBus({
  boardingPoints,
  busIndex,
  droppingPoints,
  operators,
  route,
  routeIndex,
}: {
  boardingPoints: BusPoint[];
  busIndex: number;
  droppingPoints: BusPoint[];
  operators: MockOperator[];
  route: MockRoute;
  routeIndex: number;
}): BusSearchResult {
  const operator = pick(operators, routeIndex * 5 + busIndex * 7);
  const busType = pick(BUS_TYPES, routeIndex + busIndex);
  const departureMinute = (5 * 60 + (routeIndex % 9) * 80 + busIndex * 145) % (24 * 60);
  const durationMinutes = route.durationMinutes + (busIndex - 2) * 18;
  const arrivalMinute = departureMinute + durationMinutes;
  const baseFare = Math.round((route.distanceKm * 1.65 + 480 + busIndex * 140) / 10) * 10;
  const rating = roundRating(Math.min(4.9, operator.baseRating + (busIndex % 4) * 0.08));
  const availableSeats = 9 + ((routeIndex * 11 + busIndex * 7) % 33);
  const discountAmount =
    (routeIndex + busIndex) % 3 === 0 ? 120 + ((routeIndex + busIndex) % 5) * 40 : 0;
  const amenities = selectAmenities(routeIndex, busIndex);
  const liveTracking = amenities.includes("Live Tracking");
  const seatLayout = createSeatLayout(busType, availableSeats, routeIndex + busIndex);

  return {
    supplierCode: "MOCK",
    tripId: `mock-${route.id}-${busIndex + 1}`,
    routeId: route.id,
    operatorId: operator.id,
    operatorName: operator.name,
    operatorLogoUrl: operator.logoUrl,
    busImageUrl: `https://placehold.co/640x360/${pick(BUS_IMAGE_COLORS, routeIndex + busIndex)}/ffffff?text=${encodeURIComponent(busType)}`,
    busType,
    sourceCity: route.sourceCity,
    destinationCity: route.destinationCity,
    departureTime: minutesToIso(departureMinute),
    arrivalTime: minutesToIso(arrivalMinute),
    durationMinutes,
    availableSeats,
    fare: {
      amount: baseFare - discountAmount,
      currency: "INR",
    },
    amenities,
    boardingPoints,
    droppingPoints,
    rating,
    reviewCount: 80 + ((routeIndex * 23 + busIndex * 11) % 720),
    reviews: {
      rating,
      reviewCount: 80 + ((routeIndex * 23 + busIndex * 11) % 720),
      positiveTags: [
        pick(REVIEW_TAGS, routeIndex + busIndex),
        pick(REVIEW_TAGS, routeIndex + busIndex + 3),
      ],
    },
    discountLabel: discountAmount > 0 ? `Save INR ${discountAmount}` : null,
    discountAmount,
    liveTracking,
    popularityScore: 50 + ((routeIndex * 13 + busIndex * 17) % 50),
    routePreview: route.preview,
    seatLayout,
  };
}

function applyJourneyDate(bus: BusSearchResult, journeyDate: string): BusSearchResult {
  const departure = mergeDateAndTime(journeyDate, bus.departureTime);
  const arrival = new Date(departure.getTime() + bus.durationMinutes * 60_000);

  return {
    ...bus,
    departureTime: departure.toISOString(),
    arrivalTime: arrival.toISOString(),
    boardingPoints: bus.boardingPoints.map((point) => ({
      ...point,
      time: addMinutesToClock(point.time, 0),
    })),
    droppingPoints: bus.droppingPoints.map((point) => ({
      ...point,
      time: addMinutesToClock(point.time, 0),
    })),
  };
}

function selectAmenities(routeIndex: number, busIndex: number): BusAmenity[] {
  return AMENITIES.filter(
    (_, index) => (index + routeIndex + busIndex) % 2 === 0 || index < 3,
  ).slice(0, 7);
}

function createSeatLayout(
  busType: BusType,
  availableSeats: number,
  seed: number,
): SeatLayoutPreview {
  const sleeper = busType.includes("Sleeper");
  const totalSeats = sleeper ? 36 : 44 + (seed % 4) * 2;

  return {
    totalSeats,
    availableSeats,
    decks: sleeper ? 2 : 1,
    layoutType: sleeper ? "SLEEPER" : busType === "Semi Sleeper" ? "MIXED" : "SEATER",
  };
}

function createRoutePreview(
  source: GeoPoint,
  destination: GeoPoint,
  distanceKm: number,
): RoutePreview {
  const west = Math.min(source.longitude, destination.longitude) - 0.45;
  const south = Math.min(source.latitude, destination.latitude) - 0.45;
  const east = Math.max(source.longitude, destination.longitude) + 0.45;
  const north = Math.max(source.latitude, destination.latitude) + 0.45;

  return {
    from: source,
    to: destination,
    distanceKm,
    mapBounds: [roundCoord(west), roundCoord(south), roundCoord(east), roundCoord(north)],
  };
}

function calculateDistanceKm(left: GeoPoint, right: GeoPoint): number {
  const earthKm = 6371;
  const latDelta = toRadians(right.latitude - left.latitude);
  const lonDelta = toRadians(right.longitude - left.longitude);
  const lat1 = toRadians(left.latitude);
  const lat2 = toRadians(right.latitude);
  const a =
    Math.sin(latDelta / 2) ** 2 + Math.sin(lonDelta / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getCityPoint(city: string): GeoPoint {
  const point = CITY_POINTS[city];

  if (!point) {
    throw new Error(`Unknown mock city: ${city}`);
  }

  return point;
}

function pick<T>(items: readonly T[], index: number): T {
  const item = items[index % items.length];

  if (item === undefined) {
    throw new Error("Cannot pick from an empty mock data collection");
  }

  return item;
}

function mergeDateAndTime(journeyDate: string, isoTime: string): Date {
  const source = new Date(isoTime);
  const hours = source.getUTCHours();
  const minutes = source.getUTCMinutes();
  const date = new Date(`${journeyDate}T00:00:00.000Z`);
  date.setUTCHours(hours, minutes, 0, 0);

  return date;
}

function minutesToIso(totalMinutes: number): string {
  const dayOffset = Math.floor(totalMinutes / (24 * 60));
  const minutes = totalMinutes % (24 * 60);
  const date = new Date("2026-09-10T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + dayOffset);
  date.setUTCHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

  return date.toISOString();
}

function minutesToClock(totalMinutes: number): string {
  const minutes = totalMinutes % (24 * 60);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function addMinutesToClock(clock: string, minutesToAdd: number): string {
  const [hours = "0", minutes = "0"] = clock.split(":");

  return minutesToClock(Number(hours) * 60 + Number(minutes) + minutesToAdd);
}

function roundCoord(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function roundRating(value: number): number {
  return Math.round(value * 10) / 10;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function toTitleCase(value: string): string {
  return value
    .split(/\s+/u)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1).toLowerCase()}`)
    .join(" ");
}
