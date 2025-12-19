
import { db } from "../lib/db";

async function seedAccounts() {
  const defaults = [
    { code: "1000", name: "Cash", type: "ASSET" },
    { code: "1100", name: "Accounts Receivable", type: "ASSET" },
    { code: "2000", name: "Accounts Payable", type: "LIABILITY" },
    { code: "3000", name: "Owner's Equity", type: "EQUITY" },
    { code: "4000", name: "Service Revenue", type: "INCOME" },
    { code: "6000", name: "Office Supplies Expense", type: "EXPENSE" }
  ] as const;

  for (const a of defaults) {
    await db.account.upsert({ where: { code: a.code }, update: {}, create: { code: a.code, name: a.name, type: a.type as any } });
  }
}

async function main() {
  await db.user.upsert({ where: { email: "admin@demo.com" }, update: {}, create: { email: "admin@demo.com", role: "ADMIN" } });
  await db.user.upsert({ where: { email: "hr@demo.com" }, update: {}, create: { email: "hr@demo.com", role: "HR" } });
  await db.user.upsert({ where: { email: "payroll@demo.com" }, update: {}, create: { email: "payroll@demo.com", role: "PAYROLL" } });
  const mgr = await db.user.upsert({ where: { email: "manager@demo.com" }, update: {}, create: { email: "manager@demo.com", role: "MANAGER" } });
  const empUser = await db.user.upsert({ where: { email: "employee@demo.com" }, update: {}, create: { email: "employee@demo.com", role: "EMPLOYEE" } });
  await db.user.upsert({ where: { email: "accountant@demo.com" }, update: {}, create: { email: "accountant@demo.com", role: "ACCOUNTANT" } });

  const eHourly = await db.employee.upsert({
    where: { employeeNo: "E-1001" },
    update: {},
    create: { employeeNo: "E-1001", firstName: "Riley", lastName: "Nguyen", department: "Ops", location: "NYC", payType: "HOURLY", rateCents: 2800, userId: empUser.id }
  });
  await db.employee.upsert({
    where: { employeeNo: "E-1002" },
    update: {},
    create: { employeeNo: "E-1002", firstName: "Morgan", lastName: "Patel", department: "Engineering", location: "Remote", payType: "SALARY", rateCents: 450000 }
  });

  await db.task.create({ data: { title: "Run onboarding checklist for new hire", status: "OPEN" } }).catch(()=>{});

  // Timesheet seed
  const now = new Date();
  const periodStart = new Date(now); periodStart.setDate(periodStart.getDate() - 14);
  const periodEnd = new Date(now);

  const ts = await db.timesheet.create({
    data: {
      employeeId: eHourly.id,
      periodStart,
      periodEnd,
      status: "APPROVED",
      submittedAt: new Date(),
      approvedAt: new Date(),
      decidedById: mgr.id
    }
  });

  for (let d = 1; d <= 10; d++) {
    const day = new Date(periodStart);
    day.setDate(day.getDate() + d);
    const start = new Date(day); start.setHours(9,0,0,0);
    const end = new Date(day); end.setHours(17,0,0,0);
    await db.timeEntry.create({
      data: { employeeId: eHourly.id, timesheetId: ts.id, startAt: start, endAt: end, minutes: 480, notes: "Shift" }
    });
  }

  const pg = await db.payGroup.upsert({ where: { name: "Default Biweekly" }, update: {}, create: { name: "Default Biweekly", cadence: "BIWEEKLY" } });
  await db.payRun.create({ data: { payGroupId: pg.id, status: "DRAFT", notes: "Seed draft run", periodStart, periodEnd } });

  // Bookkeeping seed
  await seedAccounts();

  // Seed a current period
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const startP = new Date(y, m, 1);
  const endP = new Date(y, m+1, 0);
  const name = `${y}-${String(m+1).padStart(2,'0')}`;
  await db.period.upsert({ where: { name }, update: {}, create: { name, startDate: startP, endDate: endP } });

  await db.salesTaxRate.upsert({ where: { name: 'Default' }, update: {}, create: { name: 'Default', rateBps: 0 } });

  const cust = await db.customer.create({ data: { name: "Acme Client", email: "acme@example.com" } });
  await db.invoice.create({
    data: {
      customerId: cust.id,
      status: "ISSUED",
      memo: "Seed invoice",
      subtotalCents: 15000,
      taxCents: 0,
      totalCents: 15000,
      lines: { create: [{ description: "Consulting", qty: 1, unitCents: 15000, amountCents: 15000 }] }
    }
  });

  const vend = await db.vendor.create({ data: { name: "Tools Vendor", email: "vendor@example.com" } });
  await db.bill.create({
    data: {
      vendorId: vend.id,
      status: "ISSUED",
      memo: "Seed bill",
      totalCents: 9900,
      lines: { create: [{ description: "Software subscription", amountCents: 9900 }] }
    }
  });

  await db.bankAccount.create({ data: { name: "Main Checking", currency: "USD" } });

  await db.analyticsEvent.create({ data: { event: "seed", actorEmail: "system", props: { version: "v5" } } }).catch(()=>{});
  console.log("Seeded V5.");
}

main().finally(async () => db.$disconnect());
