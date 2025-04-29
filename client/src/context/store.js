import { configureStore } from "@reduxjs/toolkit";
import { appReducer } from "./appReducer";

const store = configureStore({
    reducer: {store: appReducer.reducer}
})

export default store;