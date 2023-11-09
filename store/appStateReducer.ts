import type { AnyAction, Reducer } from "@reduxjs/toolkit";
import { AppState } from "./models";

export enum AppAction {
  UPDATE_TILE = "UPDATE_TILE",
}

const appStateReducer: Reducer<AppState | undefined, AnyAction> = (
  appState: AppState | undefined,
  _action: AnyAction,
): AppState | undefined => {
  return appState;
};

export default appStateReducer;
