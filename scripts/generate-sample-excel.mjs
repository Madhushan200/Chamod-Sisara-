import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

async function generateSample() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Dodoz Leisure CRM";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Accommodation Schedule", {
    views: [{ showGridLines: true }],
  });

  // Define Columns
  worksheet.columns = [
    { header: "DATE", key: "date", width: 14 },
    { header: "DAY", key: "day", width: 10 },
    { header: "HOTEL", key: "hotel", width: 34 },
    { header: "HOTEL EMAIL", key: "hotelEmail", width: 36 },
    { header: "ROOM TYPE", key: "roomType", width: 24 },
    { header: "MEAL PLAN", key: "mealPlan", width: 14 },
    { header: "SGL", key: "sgl", width: 8 },
    { header: "DBL", key: "dbl", width: 8 },
    { header: "TPL", key: "tpl", width: 8 },
    { header: "CLIENT NAME", key: "clientName", width: 30 },
    { header: "TOUR NUMBER", key: "tourNumber", width: 18 },
    { header: "REFERENCE", key: "reference", width: 16 },
    { header: "SPECIAL REQUEST", key: "specialRequest", width: 40 },
    { header: "REMARKS", key: "remarks", width: 32 },
  ];

  // Style Header Row (Navy Blue with White Bold Text)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FF334155" } },
      bottom: { style: "medium", color: { argb: "FF0170C7" } },
    };
  });

  // Sample Rows Data
  const sampleData = [
    // 1. The Kingsbury Colombo (Day 1 - 2)
    {
      date: "2026-09-10",
      day: "Day 1",
      hotel: "The Kingsbury Colombo",
      hotelEmail: "reservations@thekingsburyhotel.com",
      roomType: "Deluxe Ocean View",
      mealPlan: "BB",
      sgl: 0,
      dbl: 2,
      tpl: 0,
      clientName: "David Miller & Party (4 Pax)",
      tourNumber: "DZ-2026-092",
      reference: "REF-MIL-08",
      specialRequest: "Early check-in requested at 12:00 PM. High floor ocean view.",
      remarks: "Welcome drinks upon arrival.",
    },
    {
      date: "2026-09-11",
      day: "Day 2",
      hotel: "The Kingsbury Colombo",
      hotelEmail: "reservations@thekingsburyhotel.com",
      roomType: "Deluxe Ocean View",
      mealPlan: "BB",
      sgl: 0,
      dbl: 2,
      tpl: 0,
      clientName: "David Miller & Party (4 Pax)",
      tourNumber: "DZ-2026-092",
      reference: "REF-MIL-08",
      specialRequest: "Late breakfast option requested.",
      remarks: "Colombo city tour departure at 09:00 AM.",
    },

    // 2. Heritance Kandalama (Day 3 - 4)
    {
      date: "2026-09-12",
      day: "Day 3",
      hotel: "Heritance Kandalama",
      hotelEmail: "kandalama.res@heritancehotels.com",
      roomType: "Superior Dambulla Wing",
      mealPlan: "HB",
      sgl: 0,
      dbl: 2,
      tpl: 0,
      clientName: "David Miller & Party (4 Pax)",
      tourNumber: "DZ-2026-092",
      reference: "REF-MIL-08",
      specialRequest: "Jungle wing adjoining rooms. 1 guest vegetarian.",
      remarks: "Sigiriya rock fortress excursion.",
    },
    {
      date: "2026-09-13",
      day: "Day 4",
      hotel: "Heritance Kandalama",
      hotelEmail: "kandalama.res@heritancehotels.com",
      roomType: "Superior Dambulla Wing",
      mealPlan: "HB",
      sgl: 0,
      dbl: 2,
      tpl: 0,
      clientName: "David Miller & Party (4 Pax)",
      tourNumber: "DZ-2026-092",
      reference: "REF-MIL-08",
      specialRequest: "Packed breakfast for early Minneriya wildlife safari.",
      remarks: "Safari vehicle arranged by Dodoz Leisure.",
    },

    // 3. Grand Hotel Nuwara Eliya (Day 5 - 6)
    {
      date: "2026-09-14",
      day: "Day 5",
      hotel: "Grand Hotel Nuwara Eliya",
      hotelEmail: "reservations@grandhotel.lk",
      roomType: "Heritage Deluxe Room",
      mealPlan: "HB",
      sgl: 1,
      dbl: 1,
      tpl: 0,
      clientName: "David Miller & Party (4 Pax)",
      tourNumber: "DZ-2026-092",
      reference: "REF-MIL-08",
      specialRequest: "Fireplace heating in both rooms. High tea booking 4:00 PM.",
      remarks: "Scenic tea country drive arrival.",
    },
    {
      date: "2026-09-15",
      day: "Day 6",
      hotel: "Grand Hotel Nuwara Eliya",
      hotelEmail: "reservations@grandhotel.lk",
      roomType: "Heritage Deluxe Room",
      mealPlan: "HB",
      sgl: 1,
      dbl: 1,
      tpl: 0,
      clientName: "David Miller & Party (4 Pax)",
      tourNumber: "DZ-2026-092",
      reference: "REF-MIL-08",
      specialRequest: "Quiet rooms away from elevator.",
      remarks: "Horton Plains tour departure next morning.",
    },

    // 4. Jetwing Lighthouse Galle (Day 7 - 8)
    {
      date: "2026-09-16",
      day: "Day 7",
      hotel: "Jetwing Lighthouse Galle",
      hotelEmail: "lighthouse@jetwinghotels.com",
      roomType: "Deluxe Oceanfront",
      mealPlan: "BB",
      sgl: 0,
      dbl: 2,
      tpl: 0,
      clientName: "David Miller & Party (4 Pax)",
      tourNumber: "DZ-2026-092",
      reference: "REF-MIL-08",
      specialRequest: "Sunset view rooms. Honeymoon cake for 1 room.",
      remarks: "Galle Dutch Fort walking tour.",
    },
    {
      date: "2026-09-17",
      day: "Day 8",
      hotel: "Jetwing Lighthouse Galle",
      hotelEmail: "lighthouse@jetwinghotels.com",
      roomType: "Deluxe Oceanfront",
      mealPlan: "BB",
      sgl: 0,
      dbl: 2,
      tpl: 0,
      clientName: "David Miller & Party (4 Pax)",
      tourNumber: "DZ-2026-092",
      reference: "REF-MIL-08",
      specialRequest: "Late check-out at 2:00 PM requested.",
      remarks: "Airport transfer at 4:00 PM.",
    },

    // 5. Shangri-La Colombo (VIP Booking)
    {
      date: "2026-09-18",
      day: "Day 1",
      hotel: "Shangri-La Colombo",
      hotelEmail: "reservations.slcb@shangri-la.com",
      roomType: "Executive Lake View Suite",
      mealPlan: "BB",
      sgl: 0,
      dbl: 1,
      tpl: 0,
      clientName: "Mr. Jean-Pierre Dupont",
      tourNumber: "DZ-2026-104",
      reference: "REF-DUP-02",
      specialRequest: "Horizon Club floor access. High-speed internet.",
      remarks: "VIP luxury arrival.",
    },

    // 6. Anantara Peace Haven Tangalle Resort
    {
      date: "2026-09-20",
      day: "Day 1",
      hotel: "Anantara Peace Haven Tangalle Resort",
      hotelEmail: "tangalle@anantara.com",
      roomType: "Premier Ocean View Room",
      mealPlan: "HB",
      sgl: 0,
      dbl: 1,
      tpl: 0,
      clientName: "Alexander & Maria Schmidt",
      tourNumber: "DZ-2026-089",
      reference: "REF-SCH-01",
      specialRequest: "Anniversary celebration setup. Ocean view.",
      remarks: "Private beach dinner booking.",
    },
  ];

  sampleData.forEach((item, index) => {
    const row = worksheet.addRow(item);
    row.height = 22;
    const isEven = index % 2 === 0;

    row.eachCell((cell, colNumber) => {
      cell.font = { name: "Arial", size: 9 };
      cell.alignment = {
        vertical: "middle",
        horizontal: [1, 2, 6, 7, 8, 9, 11, 12].includes(colNumber) ? "center" : "left",
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
      if (isEven) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  
  // Save in root workspace
  fs.writeFileSync("Dodoz_Accommodation_Schedule_Sample.xlsx", Buffer.from(buffer));
  
  // Also ensure public/ folder exists and save there for direct browser static download
  if (!fs.existsSync("public")) {
    fs.mkdirSync("public", { recursive: true });
  }
  fs.writeFileSync("public/Dodoz_Accommodation_Schedule_Sample.xlsx", Buffer.from(buffer));

  console.log("Successfully created Dodoz_Accommodation_Schedule_Sample.xlsx");
}

generateSample();
