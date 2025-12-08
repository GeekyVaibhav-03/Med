// Generate contact edges from RFID events
const { RawEvent, ContactEdge, Person } = require('../models/mongodb');

async function generateContactEdges() {
  try {
    console.log('🔄 Generating contact edges from RFID events...');

    // Get all RFID events sorted by time
    const events = await RawEvent.find({})
      .sort({ entryTime: 1 });

    console.log(`📊 Found ${events.length} RFID events`);

    // Group events by room
    const roomEvents = {};
    events.forEach(event => {
      if (!roomEvents[event.room]) {
        roomEvents[event.room] = [];
      }
      roomEvents[event.room].push(event);
    });

    console.log(`🚪 Processing ${Object.keys(roomEvents).length} rooms`);

    // Find overlapping events (contacts)
    const contacts = [];
    let contactCount = 0;

    for (const room in roomEvents) {
      const eventsInRoom = roomEvents[room];
      
      // Compare each pair of events
      for (let i = 0; i < eventsInRoom.length; i++) {
        for (let j = i + 1; j < eventsInRoom.length; j++) {
          const event1 = eventsInRoom[i];
          const event2 = eventsInRoom[j];

          // Skip if same person
          if (event1.uid === event2.uid) continue;

          // Check for time overlap
          const start1 = new Date(event1.entryTime);
          const end1 = new Date(event1.exitTime || event1.entryTime);
          const start2 = new Date(event2.entryTime);
          const end2 = new Date(event2.exitTime || event2.entryTime);

          const overlapStart = start1 > start2 ? start1 : start2;
          const overlapEnd = end1 < end2 ? end1 : end2;

          // If overlap exists
          if (overlapStart < overlapEnd) {
            const durationMinutes = Math.round((overlapEnd - overlapStart) / 60000);
            
            // Only record significant contacts (> 5 minutes)
            if (durationMinutes >= 5) {
              // Calculate risk score based on duration and status
              let riskScore = durationMinutes / 60; // Base on hours
              if (event1.status === 'red' || event2.status === 'red') {
                riskScore *= 3;
              } else if (event1.status === 'yellow' || event2.status === 'yellow') {
                riskScore *= 1.5;
              }

              contacts.push({
                personAUid: event1.uid,
                personBUid: event2.uid,
                room: room,
                roomId: event1.roomId,
                overlapStart: overlapStart,
                overlapEnd: overlapEnd,
                durationMinutes: durationMinutes,
                weight: Math.min(durationMinutes / 30, 5), // Weight based on duration (max 5)
                distanceEstimate: durationMinutes > 60 ? 'close' : durationMinutes > 30 ? 'moderate' : 'far',
                contactType: (event1.status === 'red' || event2.status === 'red') ? 'direct' : 'indirect',
                riskScore: Math.round(riskScore * 10) / 10
              });

              contactCount++;
            }
          }
        }
      }
    }

    console.log(`✅ Found ${contactCount} potential contacts`);

    // Clear existing contacts and insert new ones
    await ContactEdge.deleteMany({});
    if (contacts.length > 0) {
      await ContactEdge.insertMany(contacts);
      console.log(`✅ Inserted ${contacts.length} contact edges`);
    }

    // Generate statistics
    const stats = {
      totalEvents: events.length,
      roomsProcessed: Object.keys(roomEvents).length,
      contactsGenerated: contacts.length,
      highRiskContacts: contacts.filter(c => c.contactType === 'direct').length,
      closeProximity: contacts.filter(c => c.distanceEstimate === 'close').length
    };

    console.log('\n📊 Contact Generation Summary:');
    console.log(`   Total RFID Events: ${stats.totalEvents}`);
    console.log(`   Rooms Processed: ${stats.roomsProcessed}`);
    console.log(`   Contacts Generated: ${stats.contactsGenerated}`);
    console.log(`   High Risk Contacts: ${stats.highRiskContacts}`);
    console.log(`   Close Proximity: ${stats.closeProximity}`);

    return stats;
  } catch (error) {
    console.error('❌ Error generating contact edges:', error);
    throw error;
  }
}

module.exports = { generateContactEdges };
