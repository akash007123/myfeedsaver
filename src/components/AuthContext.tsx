import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface User {
  _id: string; 
  name: string;
  email: string;
  mobile: string;
  profilePicture: string | null; 
}

// --- Add Friend-related types ---
interface FriendRequestUser { // User info for requests/friends lists
    _id: string;
    name: string;
    email: string;
    profilePicture: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null; 
  login: (email: string, password: string) => Promise<boolean>;
  signup: (formData: FormData) => Promise<void>;
  logout: () => void;
  isLoading: boolean; 
  updateProfile: (formData: FormData) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  // --- Friend Functions ---
  searchUsers: (query: string) => Promise<FriendRequestUser[]>;
  sendFriendRequest: (receiverId: string) => Promise<boolean>;
  getFriendRequests: () => Promise<FriendRequestUser[]>;
  acceptFriendRequest: (senderId: string) => Promise<boolean>;
  rejectFriendRequest: (senderId: string) => Promise<boolean>;
  getFriends: () => Promise<FriendRequestUser[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


const storeToken = (token: string) => {
  try {
    localStorage.setItem('authToken', token);
    console.log("[LocalStorage Helper] Token stored.");
  } catch (error) {
    console.error("[LocalStorage Helper] Error storing token:", error);
  }
};

const getToken = (): string | null => {
  try {
    const token = localStorage.getItem('authToken');
    console.log("[LocalStorage Helper] getToken retrieved:", token ? 'Token found' : 'No token');
    return token;
  } catch (error) {
    console.error("[LocalStorage Helper] Error getting token:", error);
    return null;
  }
};

const removeToken = () => {
  try {
    localStorage.removeItem('authToken');
    console.log("[LocalStorage Helper] Token removed.");
  } catch (error) {
    console.error("[LocalStorage Helper] Error removing token:", error);
  }
};

const storeUserData = (user: User) => {
  try {
    
    localStorage.setItem('userData', JSON.stringify(user));
    console.log("[LocalStorage Helper] User data stored.");
  } catch (error) {
    console.error("[LocalStorage Helper] Error storing user data:", error);
  }
};

const getUserData = (): User | null => {
  const data = localStorage.getItem('userData');
  console.log("[LocalStorage Helper] getUserData retrieved raw:", data);
  if (!data) {
    console.log("[LocalStorage Helper] No user data found in storage.");
    return null;
  }
  try {
    const user = JSON.parse(data);
    console.log("[LocalStorage Helper] User data parsed successfully.");
    return user;
  } catch (error) {
    console.error("[LocalStorage Helper] Error parsing user data from localStorage:", error);
    removeUserData(); 
    removeToken(); 
    return null;
  }
};

const removeUserData = () => {
  try {
    localStorage.removeItem('userData');
    console.log("[LocalStorage Helper] User data removed.");
  } catch (error) {
    console.error("[LocalStorage Helper] Error removing user data:", error);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  
  useEffect(() => {
    console.log("[AuthContext Effect] Running initial check...");
    setIsLoading(true); 

    const storedToken = getToken(); 
    const storedUser = getUserData(); 

    console.log("[AuthContext Effect] Retrieved from localStorage:", { storedToken: storedToken ? 'Exists' : 'None', storedUser: storedUser ? 'Exists' : 'None' });

    if (storedToken && storedUser) {
      console.log("[AuthContext Effect] Token and user found. Restoring state.");
      setToken(storedToken);
      setUser(storedUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      console.log("[AuthContext Effect] State updated:", { token: 'Exists', user: 'Exists' });
      console.log("[AuthContext Effect] Axios default header set.");
    } else {
      console.log("[AuthContext Effect] Token or user NOT found. Clearing any remnants.");
      setUser(null);
      setToken(null);
      removeToken(); 
      removeUserData(); 
      delete axios.defaults.headers.common['Authorization'];
      console.log("[AuthContext Effect] State and headers cleared.");
    }

    console.log("[AuthContext Effect] Initial check complete.");
    setIsLoading(false);

  }, []); 

  // --- API Client (ensure token is included) ---
  const apiClient = React.useMemo(() => {
    const instance = axios.create({
      baseURL: 'https://myfeedsave-backend.onrender.com/api', // Base URL for API calls
    });

    // Add a request interceptor to include the token
    instance.interceptors.request.use((config) => {
      const storedToken = getToken(); 
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    return instance;
  }, []); 


  const searchUsers = async (query: string): Promise<FriendRequestUser[]> => {
    try {
      const response = await apiClient.get('/friends/search', { params: { q: query } });
      return response.data.users || [];
    } catch (error: any) {
      console.error("Error searching users:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to search users");
      return [];
    }
  };

  const sendFriendRequest = async (receiverId: string): Promise<boolean> => {
    try {
      const response = await apiClient.post(`/friends/request/${receiverId}`);
      toast.success(response.data.message || "Friend request sent!");
      return true;
    } catch (error: any) {
      console.error("Error sending friend request:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to send request");
      return false;
    }
  };

  const getFriendRequests = async (): Promise<FriendRequestUser[]> => {
    try {
      const response = await apiClient.get('/friends/requests');
      return response.data.requests || [];
    } catch (error: any) {
      console.error("Error fetching friend requests:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to get requests");
      return [];
    }
  };

  const acceptFriendRequest = async (senderId: string): Promise<boolean> => {
    try {
      const response = await apiClient.put(`/friends/accept/${senderId}`);
      toast.success(response.data.message || "Friend request accepted!");
      return true;
    } catch (error: any) {
      console.error("Error accepting friend request:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to accept request");
      return false;
    }
  };

  const rejectFriendRequest = async (senderId: string): Promise<boolean> => {
    try {
      const response = await apiClient.delete(`/friends/reject/${senderId}`);
      toast.success(response.data.message || "Friend request rejected!");
      return true;
    } catch (error: any) {
      console.error("Error rejecting friend request:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to reject request");
      return false;
    }
  };

  const getFriends = async (): Promise<FriendRequestUser[]> => {
    try {
      const response = await apiClient.get('/friends');
      return response.data.friends || [];
    } catch (error: any) {
      console.error("Error fetching friends:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to get friends");
      return [];
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("[AuthContext Login] Attempting login for:", email);
    try {
      const res = await axios.post<{ token: string, user: User }>('https://myfeedsave-backend.onrender.com/api/auth/login', { email, password });
      console.log("[AuthContext Login] API Response Status:", res.status);
      // console.log("[AuthContext Login] API Response Data:", res.data); // Maybe too verbose?

      if (res.status === 200 && res.data.token && res.data.user) {
          const { token: receivedToken, user: receivedUser } = res.data;
          console.log("[AuthContext Login] Success. Storing token and user data.");

          storeToken(receivedToken); // Use helper function
          storeUserData(receivedUser); // Use helper function
          console.log("[AuthContext Login] Data stored in localStorage.");

          setToken(receivedToken);
          setUser(receivedUser);
          console.log("[AuthContext Login] React state updated.");

          axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
          console.log("[AuthContext Login] Axios default header set.");

          return true;
      } else {
          console.warn("[AuthContext Login] Login response OK but data missing or status wrong:", { status: res.status, data: res.data });
          logout();
          return false;
      }
    } catch (err: any) {
      console.error('[AuthContext Login] Login API failed:', err.response?.data || err.message);
      logout();
      return false;
    }
  };

  // --- signup function ---
  const signup = async (formData: FormData): Promise<void> => {
    console.log("[AuthContext Signup] Attempting signup...");
    try {
      const res = await axios.post('https://myfeedsave-backend.onrender.com/api/auth/signup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log("[AuthContext Signup] Signup API successful:", res.data?.message || 'OK');
      // No user/token state change needed
    } catch (err: any) {
      console.error('[AuthContext Signup] Signup API failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  // --- logout function ---
   const logout = () => {
    console.log("[AuthContext Logout] Logging out...");
    setUser(null);
    setToken(null);
    removeToken(); // Use helper function
    removeUserData(); // Use helper function
    delete axios.defaults.headers.common['Authorization'];
    console.log("[AuthContext Logout] State, localStorage, and headers cleared.");
  };

  // --- New: Update Profile API Call ---
  const updateProfile = async (formData: FormData): Promise<boolean> => {
    if (!token) {
      console.error("[AuthContext UpdateProfile] No token available.");
      return false; // Should not happen if called from protected route
    }
    console.log("[AuthContext UpdateProfile] Attempting profile update...");
    try {
      // Note: Axios default header should already include the token
      const res = await axios.put<{ message: string, user: User }>(
        'https://myfeedsave-backend.onrender.com/api/auth/profile',
        formData, // Send FormData directly (handles file uploads)
        {
          headers: {
            // Ensure Content-Type is set for FormData, though axios might do it
             'Content-Type': 'multipart/form-data',
            // Authorization header is already set by default if login was successful
          },
        }
      );

      if (res.status === 200 && res.data.user) {
        console.log("[AuthContext UpdateProfile] Update successful:", res.data.message);
        const updatedUser = res.data.user;

        // Update localStorage and state
        storeUserData(updatedUser);
        setUser(updatedUser);
        console.log("[AuthContext UpdateProfile] State and localStorage updated.");
        return true;
      } else {
        console.warn("[AuthContext UpdateProfile] Update response OK but data missing:", res);
        return false;
      }
    } catch (err: any) {
      console.error('[AuthContext UpdateProfile] Update API failed:', err.response?.data || err.message);
      // Optionally parse and throw specific validation errors if needed by the form
      // throw new Error(err.response?.data?.message || 'Profile update failed.');
      return false;
    }
  };

  // --- New: Delete Account API Call ---
  const deleteAccount = async (): Promise<boolean> => {
     if (!token) {
      console.error("[AuthContext DeleteAccount] No token available.");
      return false;
    }
    console.log("[AuthContext DeleteAccount] Attempting account deletion...");
     try {
      const res = await axios.delete('https://myfeedsave-backend.onrender.com/api/auth/profile'); // Default headers include token

      if (res.status === 200) {
         console.log("[AuthContext DeleteAccount] Deletion successful:", res.data.message);
         logout(); // Logout fully clears state, storage, and headers
         return true;
      } else {
         console.warn("[AuthContext DeleteAccount] Delete response status not 200:", res);
         return false;
      }
     } catch (err: any) {
       console.error('[AuthContext DeleteAccount] Delete API failed:', err.response?.data || err.message);
       return false;
     }
  };

  // --- Context Value (include new functions) ---
  const contextValue = {
      user,
      token,
      login,
      signup,
      logout,
      isLoading,
      updateProfile,
      deleteAccount,
      // --- Friend Functions ---
      searchUsers,
      sendFriendRequest,
      getFriendRequests,
      acceptFriendRequest,
      rejectFriendRequest,
      getFriends,
  };

  // --- Render ---
  console.log("[AuthContext Render] isLoading:", isLoading);
  return (
    <AuthContext.Provider value={contextValue}>
      {!isLoading ? children : <div>Loading App...</div> /* Show explicit loading message */}
    </AuthContext.Provider>
  );
};

// --- useAuth Hook ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
