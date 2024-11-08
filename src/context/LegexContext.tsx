import { createContext, SetStateAction, Dispatch, useContext } from "react";
import { Info } from "../@types/info";

export type LegexContextType = {
  info: Info
  setUserInfo: Dispatch<SetStateAction<Info>>
  //getTable: (filename: string, start_row: number, count: number) => Promise<Csv>
};

export const LegexContext = createContext<LegexContextType | null>(null)

export const useLegexContext = () => {
  const currentLegexContext = useContext<LegexContextType | null>(LegexContext);

  if (!currentLegexContext) {
    throw new Error(
      "No provider for context"
    );
  }

  return currentLegexContext;
};