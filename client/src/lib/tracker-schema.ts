import type { MasterKey } from "./master-store";

export type FieldType = "text" | "number" | "date" | "select" | "textarea";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  /** When set, a select field's options are resolved live from a Master Table instead of the static `options` list. */
  masterKey?: MasterKey;
  placeholder?: string;
  required?: boolean;
}

export interface StepDef {
  id: string;
  title: string;
  hint: string;
  fields: FieldDef[];
}

export const PRODUCTS = [
  "EZY Guard Smart - Z Post",
  "EZY Guard Heavy Duty - Z post",
  "Coil - 4 X 157mm (ID - 510, OD - 1310)",
  "Other",
];

export const STEPS: StepDef[] = [
  {
    id: "order",
    title: "Order & Product",
    hint: "Sales order, lot and drawing identification",
    fields: [
      { key: "soNo", label: "SO No.", type: "text", required: true, placeholder: "SQ128071" },
      { key: "lotNo", label: "Lot No.", type: "text", placeholder: "1" },
      { key: "customer", label: "Customer", type: "select", masterKey: "customers" },
      { key: "qty", label: "Qty", type: "number", required: true, placeholder: "70" },
      { key: "product", label: "Product", type: "select", masterKey: "products", required: true },
      { key: "qadPartNo", label: "QAD Part No.", type: "text", placeholder: "1G0432NGXX" },
      { key: "asDrawingNo", label: "AS Drawing No.", type: "text", placeholder: "10007390" },
      { key: "drawingRev", label: "Drawing Rev.", type: "text", placeholder: "2" },
      {
        key: "identification",
        label: "Identification",
        type: "text",
        placeholder: "ICP VI 02052026 E300 4.3 1650",
      },
    ],
  },
  {
    id: "material",
    title: "Raw Material",
    hint: "Heat / coil traceability and test reports",
    fields: [
      {
        key: "rmThickness",
        label: "Raw Material Thickness (mm)",
        type: "number",
        placeholder: "4.3",
      },
      { key: "rmMake", label: "Raw Material Make", type: "select", masterKey: "suppliers" },
      { key: "heatNo", label: "Heat No.", type: "text", placeholder: "09469" },
      { key: "coilNo", label: "Coil No.", type: "text", placeholder: "09469SCA" },
      {
        key: "millTestReportNo",
        label: "Mill Test Report No.",
        type: "text",
        placeholder: "10055702",
      },
      { key: "labReportNo", label: "Lab Report No.", type: "text", placeholder: "MGTL-0179.1" },
      {
        key: "labTestingResult",
        label: "Lab Testing Result",
        type: "select",
        options: ["Pass", "Fail", "Pending"],
      },
      {
        key: "applicableStandard",
        label: "Applicable Standard",
        type: "select",
        options: ["AS/NZS 1594:2025", "IS2062 E350", "Other"],
      },
      { key: "grade", label: "Grade", type: "select", masterKey: "grades" },
      { key: "coilWeight", label: "Coil Weight (MT)", type: "number", placeholder: "3.3" },
    ],
  },
  {
    id: "production",
    title: "Production",
    hint: "Machine, operator and shift details",
    fields: [
      {
        key: "machineNo",
        label: "Machine No.",
        type: "select",
        masterKey: "machines",
      },
      { key: "operatorName", label: "Operator Name", type: "select", masterKey: "operators" },
      { key: "shift", label: "Shift", type: "select", options: ["First", "Second", "Third"] },
    ],
  },
  {
    id: "quality",
    title: "Quality Quantities",
    hint: "Offered, accepted, rejected and hold quantities",
    fields: [
      { key: "offerQty", label: "Offer Qty (Nos)", type: "number" },
      { key: "acceptedQty", label: "Accepted Qty (Nos)", type: "number" },
      { key: "rejectedQty", label: "Rejected Qty (Nos)", type: "number" },
      { key: "holdQty", label: "Hold Qty (Nos)", type: "number" },
    ],
  },
  {
    id: "inspection",
    title: "Inspection Reports",
    hint: "Report numbers and sign-off",
    fields: [
      {
        key: "rmInspectionReportNo",
        label: "Raw Material Inspection Report No.",
        type: "text",
        placeholder: "001/31.03.2026",
      },
      {
        key: "firstPieceReportNo",
        label: "First Piece Inspection Report No.",
        type: "text",
        placeholder: "Z-post/26-05/01",
      },
      {
        key: "inprocessReportNo",
        label: "In-process Report No.",
        type: "text",
        placeholder: "Z-post/26-05/02",
      },
      {
        key: "finalReportNo",
        label: "Final Inspection Report No.",
        type: "text",
        placeholder: "Z-post/26-05/03",
      },
      {
        key: "coatingReportNo",
        label: "Coating Inspection Report No.",
        type: "text",
        placeholder: "VHSS/2026-01",
      },
      {
        key: "rmInspectionBy",
        label: "RM Inspection By",
        type: "text",
        placeholder: "Sarfraz Kazi",
      },
      {
        key: "finalInspectionBy",
        label: "Final Inspection By",
        type: "text",
        placeholder: "Sandip Nimbalkar",
      },
      {
        key: "conclusion",
        label: "Conclusion",
        type: "select",
        options: ["Lot Accepted", "Lot Rejected", "Concession Accepted", "Pending"],
      },
      { key: "remarks", label: "Remarks", type: "textarea" },
    ],
  },
  {
    id: "dispatch",
    title: "Dispatch",
    hint: "Dispatch and invoicing",
    fields: [
      { key: "dispatchDate", label: "Dispatch Date", type: "date" },
      { key: "dispatchQty", label: "Dispatch Qty", type: "number" },
      { key: "invoiceNo", label: "Invoice No.", type: "text", placeholder: "HSE26007" },
    ],
  },
];

/** Dimensional checklist taken from the Z-Post first piece / final inspection formats. */
export interface CheckRow {
  sr: string;
  parameter: string;
  specified: string;
  tolerance: string;
  instrument: string;
}

export const DIMENSIONAL_CHECKS: CheckRow[] = [
  {
    sr: "0",
    parameter: "Blank Width",
    specified: "222.9",
    tolerance: "± 2",
    instrument: "Measuring Tape",
  },
  {
    sr: "1",
    parameter: "Thickness",
    specified: "4.3",
    tolerance: "± 25",
    instrument: "Micrometer",
  },
  {
    sr: "2",
    parameter: "Length",
    specified: "1650",
    tolerance: "± 4",
    instrument: "Measuring Tape",
  },
  {
    sr: "3",
    parameter: "Height",
    specified: "90",
    tolerance: "± 1",
    instrument: "Vernier Caliper",
  },
  { sr: "4", parameter: "Width", specified: "50", tolerance: "± 2", instrument: "Vernier Caliper" },
  {
    sr: "5",
    parameter: "End straight portion",
    specified: "10",
    tolerance: "± 2",
    instrument: "Vernier Caliper",
  },
  {
    sr: "5a",
    parameter: "Angle",
    specified: "54.6°",
    tolerance: "± 2.0°",
    instrument: "Bevel Protector",
  },
  { sr: "6", parameter: "Hole Dia", specified: "8", tolerance: "-", instrument: "Vernier Caliper" },
  {
    sr: "6a",
    parameter: "Location from Top side",
    specified: "55",
    tolerance: "± 1",
    instrument: "Vernier Caliper",
  },
  {
    sr: "7",
    parameter: "Hole diameter",
    specified: "18",
    tolerance: "± 1",
    instrument: "Vernier Caliper",
  },
  {
    sr: "7a",
    parameter: "Location from 8mm dia hole",
    specified: "40",
    tolerance: "± 1",
    instrument: "Vernier Caliper",
  },
  {
    sr: "8",
    parameter: "Hole dia 8mm",
    specified: "8",
    tolerance: "± 1",
    instrument: "Vernier Caliper",
  },
  {
    sr: "8a",
    parameter: "Location from 18mm dia hole",
    specified: "40",
    tolerance: "± 1",
    instrument: "Vernier Caliper",
  },
  {
    sr: "9",
    parameter: "Location of Impression 1 from Top",
    specified: "17.5",
    tolerance: "± 1",
    instrument: "Vernier Caliper",
  },
  {
    sr: "9a",
    parameter: "Transverse width of Impression 1",
    specified: "7.5",
    tolerance: "± 1",
    instrument: "Vernier Caliper",
  },
  {
    sr: "9b",
    parameter: "Height of Impression 1",
    specified: "6.5",
    tolerance: "± 1",
    instrument: "Vernier Caliper",
  },
  {
    sr: "10",
    parameter: "Location of 2nd impression from 1st",
    specified: "48",
    tolerance: "± 1",
    instrument: "Vernier Caliper",
  },
  {
    sr: "10a",
    parameter: "Transverse width of Impression 2",
    specified: "4",
    tolerance: "± 1",
    instrument: "Vernier Caliper",
  },
  {
    sr: "10b",
    parameter: "Height of Impression 2",
    specified: "6.5",
    tolerance: "± 1",
    instrument: "Vernier Caliper",
  },
  {
    sr: "11",
    parameter: "Location of 3rd impression from 2nd",
    specified: "108",
    tolerance: "± 2",
    instrument: "Vernier Caliper",
  },
  {
    sr: "11a",
    parameter: "Transverse width of Impression 3",
    specified: "10",
    tolerance: "± 1",
    instrument: "Vernier Caliper",
  },
  {
    sr: "11b",
    parameter: "Height of Impression 3",
    specified: "8",
    tolerance: "± 1",
    instrument: "Vernier Caliper",
  },
  {
    sr: "11c",
    parameter: "Width of impression 3",
    specified: "36",
    tolerance: "± 1",
    instrument: "Vernier Caliper",
  },
  {
    sr: "12",
    parameter: "Corner Radius",
    specified: "R6",
    tolerance: "± 0.5",
    instrument: "Radius Gauge",
  },
];

export const ALL_FIELDS: FieldDef[] = STEPS.flatMap((s) => s.fields);
