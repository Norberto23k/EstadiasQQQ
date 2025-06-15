export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  read: boolean;
  createdAt: string;
  action?: {
    route: string;
    params: any;
  };
}