import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../services/api";
import { User, LoginCredentials } from "../types";

// 1. עדכון ה-AuthResponse כדי שיכלול את הנתון מה-DB (IsAdmin בתמונה 1efea9)
interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean; // כאן הוספנו את זה
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const persistedUser = localStorage.getItem("user");
const persistedToken = localStorage.getItem("token");

const initialState: AuthState = {
  user: persistedUser ? JSON.parse(persistedUser) : null,
  token: persistedToken || null,
  isAuthenticated: Boolean(persistedToken),
  loading: false,
  error: null,
};

export const login = createAsyncThunk<
  User,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials, thunkAPI) => {
  try {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    const { token, user } = response.data;

    // 2. כאן אנחנו מכניסים את ה-isAdmin לתוך ה-userData שנשמר ב-State
    const userData: User = {
      id: user?.id ?? 0,
      name: user?.name ?? credentials.email,
      email: user?.email ?? credentials.email,
      token,
      isAdmin: user?.isAdmin || false, // שליפה מה-Response של השרת
    };

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    return userData;
  } catch (error: any) {
    const message = error.response?.data || "שגיאת התחברות";
    return thunkAPI.rejectWithValue(
      typeof message === "string" ? message : "פרטים שגויים",
    );
  }
});

// שאר הקוד (Register, Logout, Slice) נשאר אותו דבר...
// ודאי רק שגם בתוך ה-PayloadAction<User> ה-User מכיל את השדה isAdmin

// Thunk להרשמה - מותאם למבנה השרת
export const register = createAsyncThunk<
  User,
  { name: string; email: string; password: string },
  { rejectValue: string }
>("auth/register", async (payload, thunkAPI) => {
  try {
    // 1. יצירת המשתמש ב-UsersController
    await api.post("/Users", payload);

    // 2. אחרי שהמשתמש נוצר בהצלחה, אנחנו "מזייפים" לוגין כדי לקבל Token
    // אנחנו קוראים ל-Action של ה-login שכבר כתבת למעלה
    const loginResult = await thunkAPI
      .dispatch(
        login({
          email: payload.email,
          password: payload.password,
        }),
      )
      .unwrap();

    return loginResult;
  } catch (error: any) {
    const message = error.response?.data || "שגיאת רישום";
    return thunkAPI.rejectWithValue(
      typeof message === "string" ? message : "נא לבדוק את פרטי הרישום",
    );
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  return;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "שגיאת התחברות";
      })
      // REGISTER
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "שגיאת רישום";
      })
      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export default authSlice.reducer;
