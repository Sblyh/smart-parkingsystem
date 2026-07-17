import { useState, useEffect, useCallback, useRef } from 'react';
import type { ParkingSpot, ParkingFloor, ParkingStats } from '@/types/parking';

export const ZONE_COLORS: Record<string, string> = {
  A: '#3b82f6',
  B: '#10b981',
  C: '#f59e0b',
  D: '#a855f7',
};

function generateSpotId(floor: string, zone: string, num: number): string {
  return `${floor}-${zone}-${String(num).padStart(3, '0')}`;
}

function randomStatus(): ParkingSpot['status'] {
  const rand = Math.random();
  if (rand < 0.45) return 'available';
  if (rand < 0.82) return 'occupied';
  if (rand < 0.90) return 'reserved';
  if (rand < 0.96) return 'disabled';
  return 'vip';
}

function generateMockPlate(): string {
  const prefixes = ['沪A', '沪B', '沪C', '沪D', '京A', '京B', '粤A', '粤B', '浙A', '苏A'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '0123456789';
  let plate = prefix;
  for (let i = 0; i < 5; i++) {
    plate += Math.random() > 0.5 ? letters[Math.floor(Math.random() * letters.length)] : digits[Math.floor(Math.random() * digits.length)];
  }
  return plate;
}

function generateEntryTime(): string {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * 8 * 60 * 60 * 1000);
  return past.toLocaleString('zh-CN', { hour12: false });
}

function generateDuration(): string {
  const hours = Math.floor(Math.random() * 8) + 1;
  const mins = Math.floor(Math.random() * 60);
  return `${hours}小时${mins}分钟`;
}

function generateReservedUntil(): string {
  const now = new Date();
  const future = new Date(now.getTime() + Math.random() * 4 * 60 * 60 * 1000);
  return future.toLocaleString('zh-CN', { hour12: false });
}

/* ── Layout constants ── */
const SPOT_W = 76;
const SPOT_H = 46;
const GAP_X = 28;
const GAP_Y = 16;

function zoneWidth(): number { return 2 * SPOT_W + GAP_X; }
function zoneHeight(spotCount: number): number {
  const rows = Math.ceil(spotCount / 2);
  return rows * SPOT_H + (rows - 1) * GAP_Y;
}

function createSpotsForZone(
  floor: string, zoneId: string, startNum: number, count: number,
  baseX: number, baseY: number, rotation: number
): ParkingSpot[] {
  const spots: ParkingSpot[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const status = randomStatus();
    const spot: ParkingSpot = {
      id: generateSpotId(floor, zoneId, startNum + i),
      number: `${zoneId}${String(startNum + i).padStart(2, '0')}`,
      status,
      floor,
      zone: zoneId,
      x: baseX + col * (SPOT_W + GAP_X),
      y: baseY + row * (SPOT_H + GAP_Y),
      rotation,
    };
    if (status === 'occupied') {
      spot.vehiclePlate = generateMockPlate();
      spot.vehicleType = ['小轿车', 'SUV', '商务车', '轿车'][Math.floor(Math.random() * 4)];
      spot.entryTime = generateEntryTime();
      spot.duration = generateDuration();
    }
    if (status === 'reserved') {
      spot.reservedUntil = generateReservedUntil();
      spot.vehiclePlate = generateMockPlate();
    }
    spots.push(spot);
  }
  return spots;
}

function generateUndergroundFloor(floor: string): ParkingFloor {
  const aY = 70;
  const aH = zoneHeight(16);
  const laneY = aY + aH + 40;
  const cY = laneY + 40;
  const aX = 60;
  const laneX = aX + zoneWidth() + 40;
  const bX = laneX + 40;

  const zones = [
    { id: 'A', name: 'A区', spots: createSpotsForZone(floor, 'A', 1, 16, aX, aY, 0) },
    { id: 'B', name: 'B区', spots: createSpotsForZone(floor, 'B', 1, 16, bX, aY, 0) },
    { id: 'C', name: 'C区', spots: createSpotsForZone(floor, 'C', 1, 12, aX, cY, 0) },
    { id: 'D', name: 'D区', spots: createSpotsForZone(floor, 'D', 1, 12, bX, cY, 0) },
  ];

  const allSpots = zones.flatMap(z => z.spots);
  const maxX = Math.max(...allSpots.map(s => s.x + SPOT_W));
  const maxY = Math.max(...allSpots.map(s => s.y + SPOT_H));

  return {
    id: floor,
    name: `${floor}层`,
    zones,
    width: maxX + 70,
    height: maxY + 70,
  };
}

/* ── Ground floor (1F): Residential community with buildings ── */
/* Road network: 2 horizontal + 3 vertical roads, forming a grid.
   Buildings are placed IN the grid cells, NOT on roads.            */

// Road layout (must match ParkingMap.tsx)
const GF = {
  roadW: 38,
  pad: 50,
  mapW: 1100,
  mapH: 800,
  // 5 road axes
  hRoad1: 250,   // upper horizontal
  hRoad2: 580,   // lower horizontal
  vRoad1: 170,   // left vertical
  vRoad2: 500,   // center vertical
  vRoad3: 830,   // right vertical
};

// Building definitions (x,y,w,h) – placed inside grid cells, away from roads
const BUILDINGS = [
  { x: 240, y: 55,  w: 120, h: 170, label: '1#楼' }, // top-left cell
  { x: 580, y: 295, w: 120, h: 170, label: '2#楼' }, // bottom-right cell
  { x: 310, y: 615, w: 120, h: 170, label: '3#楼' }, // bottom cell (below hRoad2)
];

function generateGroundFloor(): ParkingFloor {
  const floor = '1F';
  const sW = SPOT_W;
  const sH = SPOT_H;
  const gap = 14;
  const { roadW, pad, mapW, mapH, hRoad1, hRoad2, vRoad1, vRoad2, vRoad3 } = GF;

  const counters: Record<string, number> = { A: 1, B: 1, C: 1, D: 1 };
  const allSpots: ParkingSpot[] = [];

  function addSpots(zone: string, x: number, y: number, count: number, horizontal: boolean) {
    for (let i = 0; i < count; i++) {
      const status = randomStatus();
      const num = counters[zone];
      counters[zone] = num + 1;
      const sx = horizontal ? x + i * (sW + gap) : x;
      const sy = horizontal ? y : y + i * (sH + gap);
      const spot: ParkingSpot = {
        id: generateSpotId(floor, zone, num),
        number: `${zone}${String(num).padStart(2, '0')}`,
        status,
        floor,
        zone,
        x: sx,
        y: sy,
        rotation: horizontal ? 0 : 90,
      };
      if (status === 'occupied') {
        spot.vehiclePlate = generateMockPlate();
        spot.vehicleType = ['小轿车', 'SUV', '商务车', '轿车'][Math.floor(Math.random() * 4)];
        spot.entryTime = generateEntryTime();
        spot.duration = generateDuration();
      }
      if (status === 'reserved') {
        spot.reservedUntil = generateReservedUntil();
        spot.vehiclePlate = generateMockPlate();
      }
      allSpots.push(spot);
    }
  }

  // Helper: check if a spot rect overlaps any building
  function overlapsBuilding(sx: number, sy: number, sw: number, sh: number): boolean {
    return BUILDINGS.some(b =>
      sx < b.x + b.w + 16 && sx + sw > b.x - 16 &&
      sy < b.y + b.h + 16 && sy + sh > b.y - 16
    );
  }

  // Helper: check if a spot rect overlaps any road
  function overlapsRoad(sx: number, sy: number, sw: number, sh: number): boolean {
    const roads = [
      { x: 0, y: hRoad1, w: mapW, h: roadW },
      { x: 0, y: hRoad2, w: mapW, h: roadW },
      { x: vRoad1, y: 0, w: roadW, h: mapH },
      { x: vRoad2, y: 0, w: roadW, h: mapH },
      { x: vRoad3, y: 0, w: roadW, h: mapH },
    ];
    return roads.some(r =>
      sx < r.x + r.w + 8 && sx + sw > r.x - 8 &&
      sy < r.y + r.h + 8 && sy + sh > r.y - 8
    );
  }

  // Fill each grid cell with spots, avoiding buildings and roads
  const cells = [
    // Top-left (A)
    { zone: 'A', x0: vRoad1 + roadW + 15, y0: pad + 10, x1: vRoad2 - 15, y1: hRoad1 - 15 },
    // Top-center (A)
    { zone: 'A', x0: vRoad2 + roadW + 15, y0: pad + 10, x1: vRoad3 - 15, y1: hRoad1 - 15 },
    // Top-right (B)
    { zone: 'B', x0: vRoad3 + roadW + 15, y0: pad + 10, x1: mapW - pad, y1: hRoad1 - 15 },
    // Mid-left (C)
    { zone: 'C', x0: vRoad1 + roadW + 15, y0: hRoad1 + roadW + 15, x1: vRoad2 - 15, y1: hRoad2 - 15 },
    // Mid-center (C)
    { zone: 'C', x0: vRoad2 + roadW + 15, y0: hRoad1 + roadW + 15, x1: vRoad3 - 15, y1: hRoad2 - 15 },
    // Mid-right (D)
    { zone: 'D', x0: vRoad3 + roadW + 15, y0: hRoad1 + roadW + 15, x1: mapW - pad, y1: hRoad2 - 15 },
    // Bottom-left (D)
    { zone: 'D', x0: vRoad1 + roadW + 15, y0: hRoad2 + roadW + 15, x1: vRoad2 - 15, y1: mapH - pad },
    // Bottom-center (B)
    { zone: 'B', x0: vRoad2 + roadW + 15, y0: hRoad2 + roadW + 15, x1: vRoad3 - 15, y1: mapH - pad },
    // Bottom-right (A)
    { zone: 'A', x0: vRoad3 + roadW + 15, y0: hRoad2 + roadW + 15, x1: mapW - pad, y1: mapH - pad },
  ];

  for (const cell of cells) {
    const cW = cell.x1 - cell.x0;
    const cH = cell.y1 - cell.y0;
    const perRow = Math.floor((cW + gap) / (sW + gap));
    const perCol = Math.floor((cH + gap) / (sH + gap));

    for (let r = 0; r < perCol; r++) {
      for (let c = 0; c < perRow; c++) {
        const sx = cell.x0 + c * (sW + gap);
        const sy = cell.y0 + r * (sH + gap);
        if (!overlapsBuilding(sx, sy, sW, sH) && !overlapsRoad(sx, sy, sW, sH)) {
          addSpots(cell.zone, sx, sy, 1, true);
        }
      }
    }
  }

  const zones = [
    { id: 'A', name: 'A区', spots: allSpots.filter(s => s.zone === 'A') },
    { id: 'B', name: 'B区', spots: allSpots.filter(s => s.zone === 'B') },
    { id: 'C', name: 'C区', spots: allSpots.filter(s => s.zone === 'C') },
    { id: 'D', name: 'D区', spots: allSpots.filter(s => s.zone === 'D') },
  ];

  return {
    id: '1F',
    name: '1F层（地面）',
    zones,
    width: mapW,
    height: mapH,
  };
}

export function generateParkingData(): ParkingFloor[] {
  return [
    generateUndergroundFloor('B1'),
    generateUndergroundFloor('B2'),
    generateGroundFloor(),
  ];
}

function updateSpotInFloors(
  floors: ParkingFloor[],
  spotId: string,
  updater: (spot: ParkingSpot) => ParkingSpot
): ParkingFloor[] {
  return floors.map(floor => {
    const hasSpot = floor.zones.some(z => z.spots.some(s => s.id === spotId));
    if (!hasSpot) return floor;
    return {
      ...floor,
      zones: floor.zones.map(zone => ({
        ...zone,
        spots: zone.spots.map(spot =>
          spot.id === spotId ? updater({ ...spot }) : spot
        ),
      })),
    };
  });
}

function getNextStatus(currentStatus: ParkingSpot['status']): ParkingSpot['status'] | null {
  if (currentStatus === 'available') {
    return Math.random() > 0.3 ? 'occupied' : 'reserved';
  } else if (currentStatus === 'occupied') {
    return Math.random() > 0.2 ? 'available' : 'reserved';
  } else if (currentStatus === 'reserved') {
    return Math.random() > 0.4 ? 'available' : 'occupied';
  }
  return null;
}

function applyStatusChange(spot: ParkingSpot, newStatus: ParkingSpot['status']): ParkingSpot {
  const updated = { ...spot, status: newStatus };
  if (newStatus === 'occupied') {
    updated.vehiclePlate = generateMockPlate();
    updated.vehicleType = ['小轿车', 'SUV', '商务车', '轿车'][Math.floor(Math.random() * 4)];
    updated.entryTime = generateEntryTime();
    updated.duration = generateDuration();
  } else if (newStatus === 'reserved') {
    updated.reservedUntil = generateReservedUntil();
    updated.vehiclePlate = generateMockPlate();
  } else if (newStatus === 'available') {
    updated.vehiclePlate = undefined;
    updated.vehicleType = undefined;
    updated.entryTime = undefined;
    updated.duration = undefined;
    updated.reservedUntil = undefined;
  }
  return updated;
}

export function useParkingData() {
  const [floors, setFloors] = useState<ParkingFloor[]>(() => generateParkingData());
  const [currentFloor, setCurrentFloor] = useState<string>('1F');
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentFloorData = floors.find(f => f.id === currentFloor) || floors[0];
  const currentFloorSpots = currentFloorData.zones.flatMap(z => z.spots);

  const filteredSpots = currentFloorSpots.filter(s => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.number.toLowerCase().includes(q) ||
        s.vehiclePlate?.toLowerCase().includes(q) ||
        s.zone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats: ParkingStats = (() => {
    const total = currentFloorSpots.length;
    const available = currentFloorSpots.filter(s => s.status === 'available').length;
    const occupied = currentFloorSpots.filter(s => s.status === 'occupied').length;
    const reserved = currentFloorSpots.filter(s => s.status === 'reserved').length;
    const disabled = currentFloorSpots.filter(s => s.status === 'disabled').length;
    const vip = currentFloorSpots.filter(s => s.status === 'vip').length;
    return {
      total,
      available,
      occupied,
      reserved,
      disabled,
      vip,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
    };
  })();

  const simulateRealtimeUpdates = useCallback(() => {
    setFloors(prevFloors => {
      let result = prevFloors;
      const currentFloorObj = prevFloors.find(f => f.id === currentFloor);
      if (!currentFloorObj) return prevFloors;
      const allFloorSpots = currentFloorObj.zones.flatMap(z => z.spots);
      const numUpdates = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numUpdates; i++) {
        const target = allFloorSpots[Math.floor(Math.random() * allFloorSpots.length)];
        if (!target) continue;
        const newStatus = getNextStatus(target.status);
        if (!newStatus) continue;
        const updated = applyStatusChange(target, newStatus);
        result = updateSpotInFloors(result, target.id, () => updated);
      }
      return result;
    });
  }, [currentFloor]);

  useEffect(() => {
    intervalRef.current = setInterval(simulateRealtimeUpdates, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [simulateRealtimeUpdates]);

  const toggleSpotStatus = useCallback((spotId: string) => {
    setFloors(prev =>
      updateSpotInFloors(prev, spotId, spot => {
        let newStatus: ParkingSpot['status'];
        if (spot.status === 'available') {
          newStatus = 'occupied';
        } else if (spot.status === 'occupied') {
          newStatus = 'available';
        } else if (spot.status === 'reserved') {
          newStatus = 'available';
        } else {
          return spot;
        }
        return applyStatusChange(spot, newStatus);
      })
    );
  }, []);

  const setSpotStatus = useCallback((spotId: string, newStatus: ParkingSpot['status']) => {
    setFloors(prev =>
      updateSpotInFloors(prev, spotId, spot => {
        if (spot.status === newStatus) return spot;
        return applyStatusChange(spot, newStatus);
      })
    );
  }, []);

  const syncedSelectedSpot = selectedSpot
    ? currentFloorSpots.find(s => s.id === selectedSpot.id) || null
    : null;

  const reserveSpot = useCallback((spotId: string, plate: string, hours: number) => {
    setFloors(prev =>
      updateSpotInFloors(prev, spotId, spot => {
        if (spot.status !== 'available') return spot;
        const updated: ParkingSpot = {
          ...spot,
          status: 'reserved',
          vehiclePlate: plate,
          reservedUntil: new Date(Date.now() + hours * 60 * 60 * 1000).toLocaleString('zh-CN', { hour12: false }),
        };
        return updated;
      })
    );
  }, []);

  const availableSpots = currentFloorSpots.filter(s => s.status === 'available');

  return {
    floors,
    currentFloor,
    setCurrentFloor,
    currentFloorData,
    filteredSpots,
    availableSpots,
    stats,
    selectedSpot: syncedSelectedSpot,
    setSelectedSpot,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    toggleSpotStatus,
    setSpotStatus,
    reserveSpot,
    simulateRealtimeUpdates,
    ZONE_COLORS,
    currentFloorSpots,
  };
}
