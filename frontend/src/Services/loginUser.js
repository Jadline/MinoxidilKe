import axios from 'axios';

const LOGIN_URL = 'http://127.0.0.1:3000/api/v1/account/loginUser';

export async function loginUser(logininfo) {
  try {
    const response = await axios.post(LOGIN_URL, logininfo, {
      headers: {
        "Content-Type": 'application/json',
      },
    });

    console.log('login response', response.data);
    return response.data; 

  } catch (err) {
    console.error('There was an error logging in:', err?.response?.data || err.message);
    
    throw err.response?.data || new Error('Login failed');
  }
}
