import { useState, useEffect, useRef } from 'react';
import Card from '../../../components/Card';
import gsap from 'gsap';
import profileImg from "../../../assets/profile.png"; 

const Checklist = () => {
  const containerRef = useRef(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);

  // ✅ LIVE Checklist State (Per Patient)
  const [isolationChecklists, setIsolationChecklists] = useState({});

  // ✅ DEFAULT CHECKLIST (Used for every patient initially)
  const defaultChecklist = [
    { id: 1, task: 'Order Terminal Clean', completed: false, timestamp: null },
    { id: 2, task: 'Initiate Isolation Order', completed: false, timestamp: null },
    { id: 3, task: 'Notify Infection Control Team', completed: false, timestamp: null },
    { id: 4, task: 'Notify Admin Department', completed: false, timestamp: null },
    { id: 5, task: 'Update Patient Records', completed: false, timestamp: null },
    { id: 6, task: 'Arrange Contact Tracing', completed: false, timestamp: null },
  ];

  // ✅ GSAP Animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  // ✅ FETCH LIVE RFID DATA FROM BACKEND
  useEffect(() => {
    fetch("http://localhost:5000/api/rfid-data")
      .then(res => res.json())
      .then(result => {
        if (Array.isArray(result.data)) {
          const mdrOnly = result.data.filter(p => p.PROFILE === "PATIENT" && p.STATUS === "IN");

          const formatted = mdrOnly.map(p => ({
            id: p.UID,
            name: p.UID,
            room: p.ROOM,
            status: "red",
            mdrType: "MDR"
          }));

          setPatients(formatted);
        }
      })
      .catch(err => console.error("RFID Fetch Error:", err));
  }, []);

  const mdrPatients = patients.filter(p => p.status === 'red');

  // ✅ Checklist Update
  const updateChecklist = (patientId, updatedChecklist) => {
    setIsolationChecklists(prev => ({
      ...prev,
      [patientId]: updatedChecklist,
    }));
  };

  const handlePatientSelect = (patientId) => setSelectedPatient(patientId);

  const handleToggleTask = (taskId) => {
    if (!selectedPatient) return;

    const currentChecklist = isolationChecklists[selectedPatient] || defaultChecklist;

    const updatedChecklist = currentChecklist.map(task =>
      task.id === taskId
        ? { ...task, completed: !task.completed, timestamp: !task.completed ? new Date().toISOString() : null }
        : task
    );

    updateChecklist(selectedPatient, updatedChecklist);
  };

  const checklist = isolationChecklists[selectedPatient] || defaultChecklist;

  const completionRate = checklist.length > 0
    ? Math.round((checklist.filter(t => t.completed).length / checklist.length) * 100)
    : 0;

  return (
    <div ref={containerRef} className="space-y-6">

      {/* ✅ HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-dark-text">MDR Protocol & Isolation Checklist</h1>
        <p className="text-gray-600 mt-1">LIVE RFID Based Isolation Tracking</p>
      </div>

      {/* ✅ PATIENT SELECTION */}
      <Card title="Select MDR+ Patient (Live RFID)" icon="ri-user-line">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mdrPatients.map(patient => (
            <div
              key={patient.id}
              onClick={() => handlePatientSelect(patient.id)}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedPatient === patient.id
                  ? 'border-primary-teal bg-light-teal shadow-lg'
                  : 'border-grey-light hover:border-accent-blue'
              }`}
            >
              <div className="flex items-center gap-3">
                <img src={profileImg} alt={patient.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-dark-text">{patient.name}</p>
                  <p className="text-xs text-gray-600">
                    UID: {patient.id} • Room {patient.room}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ✅ PROGRESS + CHECKLIST */}
      {selectedPatient && (
        <>
          <Card title="Completion Progress" icon="ri-progress-4-line">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                <span className="text-2xl font-bold text-primary-teal">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-teal to-cta-green h-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          </Card>

          <Card title="Isolation Protocol Checklist" icon="ri-checkbox-multiple-line">
            <div className="space-y-3">
              {checklist.map(task => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-4 transition-all ${
                    task.completed ? 'bg-green-50 border-green-500' : 'bg-white border-grey-light hover:border-accent-blue'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        task.completed ? 'bg-cta-green text-white' : 'bg-gray-200 text-gray-400 hover:bg-primary-teal hover:text-white'
                      }`}
                    >
                      {task.completed
                        ? <i className="ri-checkbox-circle-fill text-xl"></i>
                        : <i className="ri-checkbox-blank-circle-line text-xl"></i>
                      }
                    </button>

                    <div className="flex-1">
                      <p className={`font-medium ${task.completed ? 'text-green-700 line-through' : 'text-dark-text'}`}>
                        {task.task}
                      </p>

                      {task.completed && task.timestamp && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Completed on {new Date(task.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Checklist;
