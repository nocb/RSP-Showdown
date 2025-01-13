import toast from "react-hot-toast";

class Notification {
  success(message: string) {
    toast.success(message);
  }

  error(message: string) {
    toast.error(message);
  }

  warning(message: string) {
    toast(message, {
      icon: '⚠️',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  }

  info(message: string) {
    toast(message, {
      icon: 'ℹ️',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  }
}

export const notification = new Notification(); 