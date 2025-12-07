import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import Card from '../../../components/Card';
import Modal from '../../../components/Modal';
import useAppStore from '../../../store/useAppStore';
import gsap from 'gsap';

const MapEditor = () => {
  const { mapConfig = {}, addRoom, updateMapConfig } = useAppStore();
  const [blueprint, setBlueprint] = useState(null);
  const [rooms, setRooms] = useState(mapConfig.rooms || []);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  const handleBlueprintUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setBlueprint(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddRoom = () => {
    const newRoom = {
      id: `R${(rooms?.length || 0) + 101}`,
      name: `Room ${(rooms?.length || 0) + 1}`,
      rfidEnabled: false,
      coordinates: { x: 50, y: 50, width: 100, height: 80 },
    };
    setRooms([...(rooms || []), newRoom]);
    addRoom(newRoom);
  };

  const handleSaveConfig = () => {
    updateMapConfig({ ...mapConfig, rooms, blueprint });
    alert('Map configuration saved successfully! / Map configuration save ho gayi!');
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };

  const handleUpdateRoom = (updates) => {
    const updatedRooms = (rooms || []).map((r) =>
      r.id === selectedRoom.id ? { ...r, ...updates } : r
    );
    setRooms(updatedRooms);
    setShowModal(false);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hospital Map Configuration</h1>
          <p className="text-gray-700 mt-1 font-medium">Upload blueprint and define room zones</p>
        </div>
        <button
          onClick={handleSaveConfig}
          className="bg-cta-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center gap-2"
        >
          <i className="ri-save-line"></i>
          Save Configuration / Save Karein
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Upload Blueprint" icon="ri-upload-cloud-line" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-accent-blue rounded-lg p-6 text-center hover:bg-light-teal transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleBlueprintUpload}
                className="hidden"
                id="blueprint-upload"
              />
              <label htmlFor="blueprint-upload" className="cursor-pointer">
                <i className="ri-image-add-line text-5xl text-accent-blue mb-2"></i>
                <p className="text-sm text-gray-600">Click to upload floor plan / Blueprint upload karein</p>
              </label>
            </div>

            <button
              onClick={handleAddRoom}
              className="w-full bg-primary-teal text-white py-2 rounded-lg hover:bg-opacity-90 transition flex items-center justify-center gap-2"
            >
              <i className="ri-add-circle-line"></i>
              Add Room / Room Add Karein
            </button>

            <div className="bg-light-teal p-4 rounded-lg">
              <h4 className="font-semibold text-dark-text mb-2">Rooms Defined</h4>
              <div className="space-y-2 max-h-64 overflow-auto">
                {(rooms || []).map((room) => (
                  <div
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className="bg-white p-3 rounded-lg cursor-pointer hover:bg-accent-blue hover:text-white transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{room.name}</p>
                        <p className="text-xs opacity-75">{room.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {room.rfidEnabled && (
                          <span className="text-xs bg-cta-green text-white px-2 py-1 rounded">RFID</span>
                        )}
                        <i className="ri-arrow-right-s-line"></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Canvas" icon="ri-artboard-line" className="lg:col-span-2" noPadding>
          <div className="bg-gray-200 p-4 flex items-center justify-center" style={{ minHeight: '500px' }}>
            {blueprint ? (
              <div className="relative w-full h-[500px]">
                <img src={blueprint} alt="Floor Plan" className="absolute inset-0 w-full h-full object-contain" />
                <Stage width={800} height={500} className="absolute inset-0">
                  <Layer>
                    {(rooms || []).map((room) => (
                      <React.Fragment key={room.id}>
                        <Rect
                          x={room.coordinates.x}
                          y={room.coordinates.y}
                          width={room.coordinates.width}
                          height={room.coordinates.height}
                          fill={room.rfidEnabled ? 'rgba(40, 185, 154, 0.3)' : 'rgba(74, 163, 195, 0.3)'}
                          stroke={room.rfidEnabled ? '#28B99A' : '#4AA3C3'}
                          strokeWidth={2}
                          onClick={() => handleRoomClick(room)}
                          onTap={() => handleRoomClick(room)}
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
                  </Layer>
                </Stage>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <i className="ri-image-line text-6xl mb-4"></i>
                <p>Upload a blueprint to start mapping</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Room Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Edit Room" size="md">
        {selectedRoom && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Room Name</label>
              <input
                type="text"
                value={selectedRoom.name}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-teal"
                onChange={(e) => setSelectedRoom({ ...selectedRoom, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Room ID</label>
              <input
                type="text"
                value={selectedRoom.id}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedRoom.rfidEnabled}
                onChange={(e) => setSelectedRoom({ ...selectedRoom, rfidEnabled: e.target.checked })}
                className="w-5 h-5"
              />
              <label className="font-medium">Enable RFID Tracking</label>
            </div>

            <button
              onClick={() => handleUpdateRoom(selectedRoom)}
              className="w-full bg-cta-green text-white py-2 rounded-lg hover:bg-opacity-90 transition"
            >
              Save Changes / Changes Save Karein
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MapEditor;
