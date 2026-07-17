export type ParkingStatus = 'available' | 'occupied' | 'reserved' | 'disabled' | 'vip';

export interface ParkingSpot {
  id: string;
  number: string;
  status: ParkingStatus;
  floor: string;
  zone: string;
  x: number;
  y: number;
  rotation: number;
  vehiclePlate?: string;
  vehicleType?: string;
  entryTime?: string;
  duration?: string;
  reservedUntil?: string;
}

export interface ParkingZone {
  id: string;
  name: string;
  spots: ParkingSpot[];
}

export interface ParkingFloor {
  id: string;
  name: string;
  zones: ParkingZone[];
  width: number;
  height: number;
}

export interface ParkingStats {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  disabled: number;
  vip: number;
  occupancyRate: number;
}
