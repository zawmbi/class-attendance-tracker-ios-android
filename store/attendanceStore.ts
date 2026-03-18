import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { defaultSettings, seedClasses, seedRecords } from "@/utils/mockData";
import {
  AttendanceRecord,
  AttendanceSettings,
  AttendanceStatus,
  ClassModel,
  PriorityLevel
} from "@/utils/types";

interface AttendanceState {
  classes: ClassModel[];
  records: AttendanceRecord[];
  settings: AttendanceSettings;
  addClass: (classItem: ClassModel) => void;
  updateClass: (classId: string, patch: Partial<ClassModel>) => void;
  deleteClass: (classId: string) => void;
  markAttendance: (classId: string, status: AttendanceStatus, notes?: string) => void;
  clearAttendanceForDate: (classId: string, date: string) => void;
  addRecord: (record: AttendanceRecord) => void;
  updateRecord: (recordId: string, patch: Partial<AttendanceRecord>) => void;
  updateRecordStatus: (recordId: string, status: AttendanceStatus) => void;
  updateSettings: (patch: Partial<AttendanceSettings>) => void;
  updateClassColor: (classId: string, color: string) => void;
  updateClassPriority: (classId: string, priority: PriorityLevel) => void;
  updateRequiredAttendance: (classId: string, requiredAttendance: number) => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set) => ({
      classes: seedClasses,
      records: seedRecords,
      settings: defaultSettings,
      addClass: (classItem) =>
        set((state) => ({
          classes: [classItem, ...state.classes]
        })),
      updateClass: (classId, patch) =>
        set((state) => ({
          classes: state.classes.map((classItem) => (classItem.id === classId ? { ...classItem, ...patch } : classItem))
        })),
      deleteClass: (classId) =>
        set((state) => ({
          classes: state.classes.filter((classItem) => classItem.id !== classId),
          records: state.records.filter((record) => record.classId !== classId)
        })),
      markAttendance: (classId, status, notes = "") =>
        set((state) => ({
          records: [
            {
              id: `record-${Date.now()}`,
              classId,
              status,
              notes,
              date: new Date().toISOString().slice(0, 10)
            },
            ...state.records.filter(
              (record) => !(record.classId === classId && record.date === new Date().toISOString().slice(0, 10))
            )
          ]
        })),
      clearAttendanceForDate: (classId, date) =>
        set((state) => ({
          records: state.records.filter((record) => !(record.classId === classId && record.date === date))
        })),
      addRecord: (record) =>
        set((state) => ({
          records: [record, ...state.records]
        })),
      updateRecord: (recordId, patch) =>
        set((state) => ({
          records: state.records.map((record) => (record.id === recordId ? { ...record, ...patch } : record))
        })),
      updateRecordStatus: (recordId, status) =>
        set((state) => ({
          records: state.records.map((record) => {
            if (record.id !== recordId) {
              return record;
            }

            if (status === "excused") {
              return {
                ...record,
                originalStatus: record.status === "excused" ? record.originalStatus : record.status,
                status
              };
            }

            return {
              ...record,
              status,
              originalStatus: undefined
            };
          })
        })),
      updateSettings: (patch) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...patch
          }
        })),
      updateClassColor: (classId, color) =>
        set((state) => ({
          classes: state.classes.map((classItem) => (classItem.id === classId ? { ...classItem, color } : classItem))
        })),
      updateClassPriority: (classId, priority) =>
        set((state) => ({
          classes: state.classes.map((classItem) => (classItem.id === classId ? { ...classItem, priority } : classItem))
        })),
      updateRequiredAttendance: (classId, requiredAttendance) =>
        set((state) => ({
          classes: state.classes.map((classItem) =>
            classItem.id === classId ? { ...classItem, requiredAttendance } : classItem
          )
        }))
    }),
    {
      name: "attendance-tracker-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
