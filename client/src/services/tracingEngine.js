/**
 * Contact Tracing Engine
 * Builds contact graphs based on room overlaps, equipment usage, and shift schedules
 */

/**
 * Calculate time overlap between two periods
 */
const hasTimeOverlap = (start1, end1, start2, end2) => {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();

  return s1 < e2 && s2 < e1;
};

/**
 * Find direct contacts (same room, overlapping time)
 */
export const findDirectContacts = (contactData, sourcePersonId) => {
  const sourcePerson = contactData.filter((entry) => entry.personId === sourcePersonId);
  const contacts = [];

  sourcePerson.forEach((sourceEntry) => {
    contactData.forEach((entry) => {
      if (
        entry.personId !== sourcePersonId &&
        entry.roomId === sourceEntry.roomId &&
        hasTimeOverlap(sourceEntry.timeIn, sourceEntry.timeOut, entry.timeIn, entry.timeOut)
      ) {
        contacts.push({
          personId: entry.personId,
          personName: entry.personName,
          contactType: 'direct',
          location: entry.roomId,
          timestamp: entry.timeIn,
          duration: Math.abs(new Date(entry.timeOut) - new Date(entry.timeIn)) / 60000, // minutes
        });
      }
    });
  });

  return contacts;
};

/**
 * Find indirect contacts (via equipment)
 */
export const findEquipmentContacts = (contactData, sourcePersonId, timeWindowHours = 48) => {
  const sourcePerson = contactData.filter((entry) => entry.personId === sourcePersonId);
  const contacts = [];

  sourcePerson.forEach((sourceEntry) => {
    if (sourceEntry.equipmentIds && sourceEntry.equipmentIds.length > 0) {
      sourceEntry.equipmentIds.forEach((equipmentId) => {
        contactData.forEach((entry) => {
          if (
            entry.personId !== sourcePersonId &&
            entry.equipmentIds &&
            entry.equipmentIds.includes(equipmentId)
          ) {
            const timeDiff =
              Math.abs(new Date(entry.timeIn) - new Date(sourceEntry.timeIn)) / (1000 * 60 * 60);

            if (timeDiff <= timeWindowHours) {
              contacts.push({
                personId: entry.personId,
                personName: entry.personName,
                contactType: 'equipment',
                equipment: equipmentId,
                timestamp: entry.timeIn,
                timeDiff: Math.round(timeDiff),
              });
            }
          }
        });
      });
    }
  });

  return contacts;
};

/**
 * Build complete contact network for a person
 */
export const buildContactNetwork = (contactData, sourcePersonId, depth = 2) => {
  const network = {
    source: sourcePersonId,
    nodes: [],
    edges: [],
  };

  const visited = new Set([sourcePersonId]);
  const queue = [{ id: sourcePersonId, level: 0 }];

  while (queue.length > 0 && queue[0].level < depth) {
    const current = queue.shift();

    // Find direct contacts
    const directContacts = findDirectContacts(contactData, current.id);
    directContacts.forEach((contact) => {
      if (!visited.has(contact.personId)) {
        visited.add(contact.personId);
        network.nodes.push({
          id: contact.personId,
          name: contact.personName,
          level: current.level + 1,
          type: 'direct',
        });
        network.edges.push({
          from: current.id,
          to: contact.personId,
          type: 'direct',
          weight: 1,
        });
        queue.push({ id: contact.personId, level: current.level + 1 });
      }
    });

    // Find equipment contacts
    const equipmentContacts = findEquipmentContacts(contactData, current.id);
    equipmentContacts.forEach((contact) => {
      if (!visited.has(contact.personId)) {
        visited.add(contact.personId);
        network.nodes.push({
          id: contact.personId,
          name: contact.personName,
          level: current.level + 1,
          type: 'equipment',
        });
        network.edges.push({
          from: current.id,
          to: contact.personId,
          type: 'equipment',
          weight: 0.5,
        });
        queue.push({ id: contact.personId, level: current.level + 1 });
      }
    });
  }

  return network;
};

/**
 * Calculate risk score for a person based on contacts
 */
export const calculateRiskScore = (contacts) => {
  let score = 0;

  contacts.forEach((contact) => {
    if (contact.contactType === 'direct') {
      score += 10;
      if (contact.duration > 15) score += 5; // >15 min contact
    } else if (contact.contactType === 'equipment') {
      score += 5;
      if (contact.timeDiff < 24) score += 3; // Within 24 hours
    }
  });

  return score;
};

/**
 * Assign risk level based on score
 */
export const getRiskLevel = (score) => {
  if (score >= 15) return 'red';
  if (score >= 5) return 'yellow';
  return 'green';
};
