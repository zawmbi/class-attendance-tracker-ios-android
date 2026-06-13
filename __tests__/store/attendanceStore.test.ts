import { useAttendanceStore } from "@/store/attendanceStore";
import { makeClass, makeRecord } from "../helpers/fixtures";

beforeEach(() => {
  useAttendanceStore.getState().reset();
});

describe("class management", () => {
  it("addClass prepends a class", () => {
    useAttendanceStore.getState().addClass(makeClass({ id: "x", name: "X" }));
    expect(useAttendanceStore.getState().classes[0].id).toBe("x");
  });

  it("deleteClass removes the class and its records", () => {
    const store = useAttendanceStore.getState();
    store.addClass(makeClass({ id: "x" }));
    store.addRecord(makeRecord({ classId: "x", date: "2026-03-02" }));
    store.deleteClass("x");
    const state = useAttendanceStore.getState();
    expect(state.classes.find((c) => c.id === "x")).toBeUndefined();
    expect(state.records.find((r) => r.classId === "x")).toBeUndefined();
  });

  it("updateRequiredAttendance patches just that field", () => {
    useAttendanceStore.getState().addClass(makeClass({ id: "x", requiredAttendance: 80 }));
    useAttendanceStore.getState().updateRequiredAttendance("x", 90);
    expect(useAttendanceStore.getState().classes.find((c) => c.id === "x")?.requiredAttendance).toBe(90);
  });
});

describe("attendance records", () => {
  it("markAttendance replaces an existing same-day record for the class", () => {
    const store = useAttendanceStore.getState();
    store.addClass(makeClass({ id: "x" }));
    store.markAttendance("x", "present");
    store.markAttendance("x", "late");
    const today = new Date().toISOString().slice(0, 10);
    const todays = useAttendanceStore.getState().records.filter((r) => r.classId === "x" && r.date === today);
    expect(todays).toHaveLength(1);
    expect(todays[0].status).toBe("late");
  });

  it("updateRecordStatus to excused preserves the original status", () => {
    const store = useAttendanceStore.getState();
    store.addRecord(makeRecord({ id: "r1", status: "absent" }));
    store.updateRecordStatus("r1", "excused");
    const record = useAttendanceStore.getState().records.find((r) => r.id === "r1");
    expect(record?.status).toBe("excused");
    expect(record?.originalStatus).toBe("absent");
  });

  it("updateRecordStatus away from excused clears the original status", () => {
    const store = useAttendanceStore.getState();
    store.addRecord(makeRecord({ id: "r1", status: "absent" }));
    store.updateRecordStatus("r1", "excused");
    store.updateRecordStatus("r1", "present");
    const record = useAttendanceStore.getState().records.find((r) => r.id === "r1");
    expect(record?.status).toBe("present");
    expect(record?.originalStatus).toBeUndefined();
  });

  it("clearAttendanceForDate removes only that class/day record", () => {
    const store = useAttendanceStore.getState();
    store.addRecord(makeRecord({ id: "r1", classId: "x", date: "2026-03-02" }));
    store.addRecord(makeRecord({ id: "r2", classId: "x", date: "2026-03-04" }));
    store.clearAttendanceForDate("x", "2026-03-02");
    const records = useAttendanceStore.getState().records.filter((r) => r.classId === "x");
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe("r2");
  });
});

describe("sample data + reset", () => {
  it("loadSampleData populates classes and records", () => {
    useAttendanceStore.getState().loadSampleData();
    expect(useAttendanceStore.getState().classes.length).toBeGreaterThan(0);
    expect(useAttendanceStore.getState().records.length).toBeGreaterThan(0);
  });
  it("reset empties classes and records", () => {
    useAttendanceStore.getState().loadSampleData();
    useAttendanceStore.getState().reset();
    expect(useAttendanceStore.getState().classes).toHaveLength(0);
    expect(useAttendanceStore.getState().records).toHaveLength(0);
  });
});
