export class RemindersService {
  async scheduleForBooking(bookingId: string) {
    setTimeout(() => {
      console.log(`[reminder] (stub) would send 24h reminder for booking=${bookingId}`);
    }, 1000);
  }
}
