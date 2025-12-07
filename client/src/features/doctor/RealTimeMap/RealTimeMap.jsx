import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
import Card from '../../../components/Card';
import useAppStore from '../../../store/useAppStore';
import websocketMock from '../../../services/websocketMock';
import gsap from 'gsap';

const RealTimeMap = () => {
  const { mapConfig } = useAppStore();
  const [people, setPeople] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const containerRef = useRef(null);

  // Animate container on mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  // Subscribe to WebSocket updates
  useEffect(() => {
    if (!isLive) return;

    const unsubscribe = websocketMock.subscribe((data) => {
      setPeople(data.people);
    });

    websocketMock.start(3000); // Poll every 3s

    return () => unsubscribe();
  }, [isLive]);

  const handleStartLive = () => {
    setIsLive(true);
    setPeople(websocketMock.getCurrentState()?.people || []);
  };

  const handleStopLive = () => {
    setIsLive(false);
    websocketMock.stop();
  };

  const getStatusColor = (status) => {
    const colors = {
      red: '#EF4444',
      yellow: '#F59E0B',
      green: '#10B981',
    };
    return colors[status] || colors.green;
  };

  const getRoomCoordinates = (roomId) => {
    const room = mapConfig?.rooms?.find((r) => r.id === roomId);
    return room
      ? {
          x: room.coordinates.x + room.coordinates.width / 2,
          y: room.coordinates.y + room.coordinates.height / 2,
        }
      : { x: 400, y: 250 }; // Default position if room not found
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Interactive Map</h1>
          <p className="text-gray-700 mt-1 font-medium">
            Live tracking of people in hospital / Live tracking dekho
          </p>
        </div>
        <div className="flex gap-3">
          {isLive ? (
            <button
              onClick={handleStopLive}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center gap-2"
            >
              <i className="ri-stop-circle-line"></i>
              Stop Live / Band Karo
            </button>
          ) : (
            <button
              onClick={handleStartLive}
              className="bg-cta-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center gap-2"
            >
              <i className="ri-play-circle-line"></i>
              Start Live / Shuru Karo
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <Card title="Color Legend" icon="ri-information-line">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-sm">🟥 Red = Confirmed MDR/Threat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">🟨 Yellow = Risky/Contacted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm">🟩 Green = Safe</span>
          </div>
          {isLive && (
            <div className="ml-auto flex items-center gap-2">
              <span className="w-2 h-2 bg-cta-green rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-cta-green">LIVE</span>
            </div>
          )}
        </div>
      </Card>

      {/* Map Canvas */}
      <Card title="Hospital Floor Map" icon="ri-map-pin-line" noPadding>
        <div className="bg-gray-200 p-4">
          <Stage width={800} height={500} className="bg-white rounded-lg border-2 border-gray-300">
            <Layer>
              {mapConfig?.rooms?.map((room) => (
                <React.Fragment key={room.id}>
                  <Rect
                    x={room.coordinates.x}
                    y={room.coordinates.y}
                    width={room.coordinates.width}
                    height={room.coordinates.height}
                    fill="#E6F7F5"
                    stroke="#0E8B86"
                    strokeWidth={2}
                  />
                  <Text
                    x={room.coordinates.x + 10}
                    y={room.coordinates.y + 10}
                    text={room.name}
                    fontSize={14}
                    fontFamily="Poppins"
                    fill="#102026"
                  />
                </React.Fragment>
              ))}

              {people.map((person) => {
                const pos = getRoomCoordinates(person.room);
                const offsetX = (Math.random() - 0.5) * 40;
                const offsetY = (Math.random() - 0.5) * 40;

                return (
                  <React.Fragment key={person.id}>
                    <Circle
                      x={pos.x + offsetX}
                      y={pos.y + offsetY}
                      radius={12}
                      fill={getStatusColor(person.status)}
                      shadowBlur={10}
                      shadowColor={getStatusColor(person.status)}
                      shadowOpacity={0.6}
                    />
                    <Text
                      x={pos.x + offsetX - 30}
                      y={pos.y + offsetY + 18}
                      text={person.name.split(' ')[0]}
                      fontSize={10}
                      fontFamily="Poppins"
                      fill="#102026"
                      align="center"
                      width={60}
                    />
                  </React.Fragment>
                );
              })}
            </Layer>
          </Stage>
        </div>
      </Card>

      {/* People List */}
      <Card title="Currently Tracked People" icon="ri-user-location-line">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person) => (
            <div
              key={person.id}
              className="border border-grey-light rounded-lg p-3 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: getStatusColor(person.status) }}
                >
                  {person.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-dark-text">{person.name}</p>
                  <p className="text-xs text-gray-600">
                    {person.id} • Room {person.room}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default RealTimeMap;
