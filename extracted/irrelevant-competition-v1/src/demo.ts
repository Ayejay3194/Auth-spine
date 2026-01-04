import { GhostBookingEngine } from "./modules/ghostBooking.js";
const g = new GhostBookingEngine();
console.log(g.detectIntent("ugh I need a haircut"));
