// src/App.jsx
import {HashRouter, Route, Routes} from "react-router-dom";
import LaunchTronLink from "./pages/LaunchTronLink";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/launch-tronlink" element={<LaunchTronLink/>}/>
        <Route path="*" element={<div style={{padding: 16}}>Home</div>}/>
      </Routes>
    </HashRouter>
  );
}