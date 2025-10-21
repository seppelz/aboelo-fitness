import api from './api';

export interface ContactFormPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const submitContactForm = async (payload: ContactFormPayload) => {
  const response = await api.post('/contact', payload);
  return response.data;
};
