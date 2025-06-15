export interface Loan {
  id: string;
  materialId: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'overdue';
  returnedDate?: string;
  condition?: string;
  notes?: string;
}