import { useState, useEffect, useRef } from 'react';
import Card from '../../../components/Card';
import Modal from '../../../components/Modal';
import useAppStore from '../../../store/useAppStore';
import gsap from 'gsap';

const AlertsConfig = () => {
  // Default alertRules to [] to avoid undefined
  const { alertRules = [], addAlertRule, updateAlertRule } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const containerRef = useRef(null);

  const triggerOptions = [
    'MDR Lab Result Posted',
    'Isolation Breach',
    'Screening Overdue',
    'Equipment Contamination',
    'High Risk Contact',
    'Room Overcapacity',
  ];

  const teamOptions = ['Doctors', 'Nurses', 'Admin', 'Security', 'Lab Staff', 'Management'];

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  const handleAddRule = () => {
    setEditingRule(null);
    setShowModal(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setShowModal(true);
  };

  const handleSaveRule = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const teams = formData.getAll('teams');

    const ruleData = {
      trigger: formData.get('trigger'),
      teams,
      enabled: formData.get('enabled') === 'on',
    };

    if (editingRule) {
      updateAlertRule(editingRule.id, ruleData);
    } else {
      addAlertRule(ruleData);
    }

    setShowModal(false);
  };

  const handleToggleRule = (ruleId, enabled) => {
    updateAlertRule(ruleId, { enabled: !enabled });
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Automated Alert Configuration</h1>
          <p className="text-gray-600 mt-1">Define triggers and notification rules</p>
        </div>
        <button
          onClick={handleAddRule}
          className="bg-cta-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center gap-2"
        >
          <i className="ri-add-circle-line"></i>
          Add Alert Rule / Rule Add Karein
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(alertRules || []).map((rule) => (
          <Card key={rule.id} className="relative">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => handleToggleRule(rule.id, rule.enabled)}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                  rule.enabled ? 'bg-cta-green text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {rule.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="pr-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-light-teal rounded-lg flex items-center justify-center">
                  <i className="ri-notification-3-line text-2xl text-primary-teal"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-dark-text">{rule.trigger}</h3>
                  <p className="text-xs text-gray-500">Alert Trigger</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Notify Teams:</p>
                <div className="flex flex-wrap gap-2">
                  {(rule.teams || []).map((team) => (
                    <span
                      key={team}
                      className="bg-accent-blue text-white px-3 py-1 rounded-full text-xs"
                    >
                      {team}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEditRule(rule)}
                  className="flex-1 bg-primary-teal text-white py-2 rounded-lg hover:bg-opacity-90 transition text-sm"
                >
                  <i className="ri-edit-line mr-1"></i>
                  Edit
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {(alertRules || []).length === 0 && (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <i className="ri-notification-off-line text-6xl mb-4"></i>
            <p>No alert rules configured yet</p>
            <p className="text-sm">Click "Add Alert Rule" to create one</p>
          </div>
        </Card>
      )}

      {/* Add/Edit Rule Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRule ? 'Edit Alert Rule' : 'Add Alert Rule'}
      >
        <form onSubmit={handleSaveRule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Trigger Event</label>
            <select
              name="trigger"
              defaultValue={editingRule?.trigger || ''}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-teal"
            >
              <option value="">Select trigger...</option>
              {triggerOptions.map((trigger) => (
                <option key={trigger} value={trigger}>
                  {trigger}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notify Teams</label>
            <div className="space-y-2 max-h-48 overflow-auto border border-gray-300 rounded-lg p-3">
              {teamOptions.map((team) => (
                <label
                  key={team}
                  className="flex items-center gap-2 cursor-pointer hover:bg-light-teal p-2 rounded"
                >
                  <input
                    type="checkbox"
                    name="teams"
                    value={team}
                    defaultChecked={(editingRule?.teams || []).includes(team)}
                    className="w-4 h-4"
                  />
                  <span>{team}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={editingRule?.enabled ?? true}
              className="w-5 h-5"
            />
            <label className="font-medium">Enable this rule immediately</label>
          </div>

          <button
            type="submit"
            className="w-full bg-cta-green text-white py-3 rounded-lg hover:bg-opacity-90 transition font-semibold"
          >
            {editingRule ? 'Update Rule' : 'Create Rule'} / Save Karein
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AlertsConfig;
