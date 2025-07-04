import { useContext } from "react";
import AppContext from "../context/AppContext.js";

export default function useAppContext() {
    return useContext(AppContext);
}
// This custom hook allows components to access the AppContext easily