import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

export const staffApi = {
  acceptInvite: async (uid: string, token: string, password: string) => {
    const response = await axios.post(`${BASE_URL}/auth/staff/accept-invite/${uid}/${token}/`, {
      password,
    });
    return response.data;
  },
};
