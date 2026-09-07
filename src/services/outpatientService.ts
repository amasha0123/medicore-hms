
import { OutpatientQueueItem, OutpatientQueueStatus } from '../types/outpatient';
import { INITIAL_OUTPATIENT_QUEUE } from '../data/mockData';
import { getStoredItem, setStoredItem } from './storage';

const QUEUE_KEY = 'medicore_outpatient_queue';

export const outpatientService = {
  getQueue(): OutpatientQueueItem[] {
    return getStoredItem<OutpatientQueueItem[]>(QUEUE_KEY, INITIAL_OUTPATIENT_QUEUE);
  },

  addToQueue(data: Omit<OutpatientQueueItem, 'id' | 'queueNumber' | 'status'>): OutpatientQueueItem {
    const queue = this.getQueue();
    const prefix = data.priority === 'Emergency' ? 'EM' : 'A';
    const nextItem: OutpatientQueueItem = {
      ...data,
      id: `q-${Date.now().toString(36)}`,
      queueNumber: `${prefix}-${100 + queue.length + 1}`,
      status: 'Waiting'
    };
    setStoredItem(QUEUE_KEY, [...queue, nextItem]);
    return nextItem;
  },

  updateStatus(id: string, status: OutpatientQueueStatus): OutpatientQueueItem {
    const queue = this.getQueue();
    let updated: OutpatientQueueItem | null = null;
    const next = queue.map(item => {
      if (item.id === id) {
        updated = {
          ...item,
          status,
          consultationStartTime: status === 'In Consultation' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : item.consultationStartTime
        };
        return updated;
      }
      return item;
    });
    setStoredItem(QUEUE_KEY, next);
    return updated!;
  }
};
