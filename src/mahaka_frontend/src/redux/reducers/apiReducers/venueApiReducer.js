import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import notificationManager from "../../../common/utils/notificationManager";

// initial states
const initialState = {
  venues: [],
  currentVenue: null,
  loading: true,
  error: null,
  createVenueLoader: false,
  buyTicketLoading: false,
};

// async operations
export const getAllVenues = createAsyncThunk(
  "venues/getAllVenues",
  async ({ backend, pageLimit, currPage }) => {
    // try {
    const response = await backend.getAllVenues(pageLimit, currPage);
    return response.data;
    // } catch (err) {
    //   console.error("Error fetching all venues ", err);
    // }
  }
);

// Get single venue
export const getVenue = createAsyncThunk(
  "venues/getVenue",
  async ({ backend, venueId }) => {
    const response = await backend.getVenue(venueId);
    return response;
  }
);

// Delete venue
export const deleteVenue = createAsyncThunk(
  "venues/deleteVenue",
  async ({ backend, venueId }) => {
    await backend.deleteVenue(venueId);
    return venueId;
  }
);

// UpdateVenue
export const updateVenue = createAsyncThunk(
  "venues/updateVenue",
  async ({
    backend,
    venueId,
    updatedTitle,
    updatedDescription,
    eventDetails,
    capacity,
    logo,
    banner,
    action,
  }) => {
    try {
      const response = await backend.updateVenue(
        venueId,
        [],
        [],
        updatedTitle,
        updatedDescription,
        eventDetails,
        capacity,
        logo,
        banner
      );
      action(false);
      return response;
    } catch (err) {
      console.error("Error while updating venue", err);
    }
  }
);

//Create Venue
export const createVenue = createAsyncThunk(
  "venues/createVenue",
  async ({
    backend,
    collectionDetails,
    title,
    capacity,
    details,
    description,
    action,
  }) => {
    try {
      const response = await backend.createVenue(
        collectionDetails,
        title,
        capacity,
        details,
        description
      );
      action(false);
      return response;
    } catch (error) {
      throw error;
    }
  }
);

//buy Venue Ticket
export const buyVenueTicket = createAsyncThunk(
  "venues/buyVenueTicket",
  async ({ backend, venueId, ticket_type, record }) => {
    try {
      const response = await backend.buyVenueTicket(
        venueId,
        ticket_type,
        record
      );
      console.log("Venue ticket purchase response:", response);
      return response;
    } catch (error) {
      console.error("Error buying venue ticket:", error);
      throw error;
    }
  }
);

export const searchVenues = createAsyncThunk(
  "venues/searchVenues",
  async ({ backend, searchText, pageLimit, currPage }) => {
    try {
      const response = await backend.searchVenues(
        searchText,
        pageLimit,
        currPage
      );
      return response.data;
    } catch (error) {
      console.error("Error searching venues:", error);
      throw error;
    }
  }
);

// Create slice
const venueSlice = createSlice({
  name: "venues",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllVenues.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = action.payload;
        state.error = null;
      })
      .addCase(getAllVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getVenue.pending, (state) => {
        state.loading = true;
      })
      .addCase(getVenue.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVenue = action.payload;
        state.error = null;
      })
      .addCase(getVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteVenue.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteVenue.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = state.venues.filter(
          (venue) => venue.id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Fix later : create and update
      .addCase(updateVenue.pending, (state) => {
        state.createVenueLoader = true;
      })
      .addCase(updateVenue.fulfilled, (state, action) => {
        state.createVenueLoader = false;
        const updatedVenue = action.payload;
        state.venues = state.venues.map((venue) =>
          venue.id === updatedVenue.id ? updatedVenue : venue
        );
        if (state.currentVenue && state.currentVenue.id === updatedVenue.id) {
          state.currentVenue = updatedVenue;
        }
        state.error = null;
        notificationManager.success("Venue updated successfully");
      })
      .addCase(updateVenue.rejected, (state, action) => {
        state.createVenueLoader = false;
        state.error = action.error.message;
        notificationManager.error("Failed to update venue");
      })
      .addCase(createVenue.pending, (state) => {
        state.createVenueLoader = true;
        state.error = null;
      })
      .addCase(createVenue.fulfilled, (state, action) => {
        state.createVenueLoader = false;
        state.venues.push(action.payload[1]);
        state.error = null;
        notificationManager.success("Venue created successfully");
      })
      .addCase(createVenue.rejected, (state, action) => {
        state.createVenueLoader = false;
        state.error = action.error.message;
        notificationManager.error("Failed to create venue");
      })

      .addCase(buyVenueTicket.pending, (state) => {
        state.buyTicketLoading = true;
      })
      .addCase(buyVenueTicket.fulfilled, (state, action) => {
        state.buyTicketLoading = false;
        state.tickets = [...state.tickets, action.payload];
        state.error = null;
        notificationManager.success("Venue ticket purchased successfully");
      })
      .addCase(buyVenueTicket.rejected, (state, action) => {
        state.buyTicketLoading = false;
        state.error = action.error.message;
        notificationManager.error("Failed to purchase venue ticket");
      })
      .addCase(searchVenues.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = action.payload;
        state.error = null;
      })
      .addCase(searchVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default venueSlice.reducer;
