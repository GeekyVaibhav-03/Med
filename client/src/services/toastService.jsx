// Toast Service using React Toastify
import { toast } from 'react-toastify';

// Toast configuration options
const defaultOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Success toast
export const showSuccess = (message, options = {}) => {
  toast.success(message, { ...defaultOptions, ...options });
};

// Error toast
export const showError = (message, options = {}) => {
  toast.error(message, { ...defaultOptions, autoClose: 5000, ...options });
};

// Warning toast
export const showWarning = (message, options = {}) => {
  toast.warning(message, { ...defaultOptions, ...options });
};

// Info toast
export const showInfo = (message, options = {}) => {
  toast.info(message, { ...defaultOptions, ...options });
};

// MDR Alert toast - special styling for MDR alerts
export const showMDRAlert = (patientName, organism, options = {}) => {
  toast.error(
    <div>
      <div className="font-bold text-lg">🚨 MDR Alert!</div>
      <div className="mt-1">
        <span className="font-semibold">{patientName}</span> has been flagged for MDR
      </div>
      <div className="text-sm mt-1 opacity-90">Organism: {organism}</div>
    </div>,
    {
      ...defaultOptions,
      autoClose: 8000,
      className: 'mdr-alert-toast',
      icon: false,
      ...options,
    }
  );
};

// Contact Alert toast - for contact tracing alerts
export const showContactAlert = (sourcePatient, contactCount, options = {}) => {
  toast.warning(
    <div>
      <div className="font-bold">⚠️ Contact Tracing Required</div>
      <div className="mt-1">
        <span className="font-semibold">{sourcePatient}</span> has{' '}
        <span className="font-bold text-orange-700">{contactCount}</span> potential contacts
      </div>
    </div>,
    {
      ...defaultOptions,
      autoClose: 6000,
      icon: false,
      ...options,
    }
  );
};

// Isolation Alert toast
export const showIsolationAlert = (patientName, ward, options = {}) => {
  toast.error(
    <div>
      <div className="font-bold">🔒 Isolation Required</div>
      <div className="mt-1">
        <span className="font-semibold">{patientName}</span> requires immediate isolation
      </div>
      <div className="text-sm mt-1 opacity-90">Ward: {ward}</div>
    </div>,
    {
      ...defaultOptions,
      autoClose: 10000,
      icon: false,
      ...options,
    }
  );
};

// Lab Report Alert
export const showLabReportAlert = (patientName, testType, isMDR = false, options = {}) => {
  const toastFn = isMDR ? toast.error : toast.info;
  toastFn(
    <div>
      <div className="font-bold">{isMDR ? '🧪 MDR Detected in Lab Report!' : '📋 New Lab Report'}</div>
      <div className="mt-1">
        Patient: <span className="font-semibold">{patientName}</span>
      </div>
      <div className="text-sm mt-1 opacity-90">Test: {testType}</div>
    </div>,
    {
      ...defaultOptions,
      autoClose: isMDR ? 8000 : 4000,
      icon: false,
      ...options,
    }
  );
};

// Network built toast
export const showNetworkBuilt = (patientName, nodeCount, options = {}) => {
  toast.success(
    <div>
      <div className="font-bold">🕸️ Network Generated</div>
      <div className="mt-1">
        Contact network for <span className="font-semibold">{patientName}</span>
      </div>
      <div className="text-sm mt-1 opacity-90">{nodeCount} contacts identified</div>
    </div>,
    {
      ...defaultOptions,
      icon: false,
      ...options,
    }
  );
};

// Login/Logout toasts
export const showLoginSuccess = (username, role, options = {}) => {
  toast.success(
    <div>
      <div className="font-bold">✅ Login Successful</div>
      <div className="mt-1">
        Welcome back, <span className="font-semibold">{username}</span>!
      </div>
      <div className="text-sm mt-1 opacity-90 capitalize">Role: {role}</div>
    </div>,
    {
      ...defaultOptions,
      icon: false,
      ...options,
    }
  );
};

export const showLogoutSuccess = (options = {}) => {
  toast.info('👋 You have been logged out successfully', {
    ...defaultOptions,
    ...options,
  });
};

// Patient status update
export const showPatientStatusUpdate = (patientName, status, options = {}) => {
  const isPositive = status === 'positive';
  const toastFn = isPositive ? toast.error : toast.success;
  toastFn(
    <div>
      <div className="font-bold">
        {isPositive ? '🔴 MDR Status: Positive' : '🟢 MDR Status: Negative'}
      </div>
      <div className="mt-1">
        Patient: <span className="font-semibold">{patientName}</span>
      </div>
    </div>,
    {
      ...defaultOptions,
      icon: false,
      ...options,
    }
  );
};

// Generic promise toast for async operations
export const showPromise = (promise, messages, options = {}) => {
  return toast.promise(
    promise,
    {
      pending: messages.pending || 'Processing...',
      success: messages.success || 'Operation completed successfully!',
      error: messages.error || 'Something went wrong!',
    },
    { ...defaultOptions, ...options }
  );
};

// Dismiss all toasts
export const dismissAll = () => {
  toast.dismiss();
};

// Export toast for custom usage
export { toast };

export default {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  mdrAlert: showMDRAlert,
  contactAlert: showContactAlert,
  isolationAlert: showIsolationAlert,
  labReport: showLabReportAlert,
  networkBuilt: showNetworkBuilt,
  loginSuccess: showLoginSuccess,
  logoutSuccess: showLogoutSuccess,
  patientStatus: showPatientStatusUpdate,
  promise: showPromise,
  dismissAll,
};
