BACKUP / RESTORE DRILL
======================

Weekly:
- Verify backup job ran
- Verify backup size is plausible
- Verify encryption enabled
- Verify retention window

Monthly drill:
1) Restore backup into staging
2) Run smoke tests (auth, booking, reporting)
3) Validate key totals (users, bookings, invoices)
4) Document time-to-restore and issues

If restore fails, backups are decoration.
