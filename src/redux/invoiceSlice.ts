import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../services/api";
import { Invoice } from "../types";

interface InvoiceState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  invoices: [],
  loading: false,
  error: null,
};

// thunk להבאת חשבוניות מהשרת
export const fetchInvoices = createAsyncThunk<
  Invoice[],
  void,
  { rejectValue: string }
>("invoice/fetchInvoices", async (_, thunkAPI) => {
  try {
    const response = await api.get<Invoice[]>("/invoices");
    return response.data;
  } catch (error: unknown) {
    const message =
      (error as any)?.response?.data?.message ?? "שגיאה בטעינת חשבוניות";
    return thunkAPI.rejectWithValue(message);
  }
});

// thunk למחיקת חשבונית לפי id
export const deleteInvoice = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("invoice/deleteInvoice", async (id, thunkAPI) => {
  try {
    await api.delete(`/invoices/${id}`);
    return id;
  } catch (error: unknown) {
    const message =
      (error as any)?.response?.data?.message ?? "שגיאה במחיקת חשבונית";
    return thunkAPI.rejectWithValue(message);
  }
});

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchInvoices.fulfilled,
        (state, action: PayloadAction<Invoice[]>) => {
          state.invoices = action.payload;
          state.loading = false;
        },
      )
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "שגיאה בטעינת חשבוניות";
      })
      .addCase(deleteInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteInvoice.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.invoices = state.invoices.filter(
            (invoice) => invoice.id !== action.payload,
          );
          state.loading = false;
        },
      )
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "שגיאה במחיקת חשבונית";
      });
  },
});

export default invoiceSlice.reducer;
