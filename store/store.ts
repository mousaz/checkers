import { configureStore } from "@reduxjs/toolkit";
import { batchedSubscribe } from "redux-batched-subscribe";
import _ from "lodash";
import { AppState } from "./models";
import appStateReducer from "./appStateReducer";

const preloadedState: AppState = {
  gameState: {
    gameOutCome: "NotStarted",
    whosTurn: 0,
    commentary: {
      gameComment: "Let's play!!!",
    },
  },
};

export const store = configureStore({
  reducer: appStateReducer,
  devTools: process.env.NODE_ENV !== "production",
  preloadedState,
  enhancers: [batchedSubscribe(_.debounce(notify => notify()))],
});
