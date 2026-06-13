import WidgetKit
import SwiftUI

// Must match the App Group in app.config.ts (ios.entitlements + the target config).
private let appGroup = "group.com.attendancetrackerappsorganization.attendancetrackerapp"
// Must match the key written from JS in services/widget.ts.
private let storageKey = "todayClasses"

struct ClassItem: Codable, Hashable {
  let name: String
  let time: String
  let status: String?
}

struct TodayData: Codable {
  let dateLabel: String
  let classes: [ClassItem]
}

private func loadTodayData() -> TodayData {
  let defaults = UserDefaults(suiteName: appGroup)
  if let raw = defaults?.string(forKey: storageKey),
     let jsonData = raw.data(using: .utf8),
     let decoded = try? JSONDecoder().decode(TodayData.self, from: jsonData) {
    return decoded
  }
  return TodayData(dateLabel: "", classes: [])
}

struct AttendizeEntry: TimelineEntry {
  let date: Date
  let data: TodayData
}

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> AttendizeEntry {
    AttendizeEntry(
      date: Date(),
      data: TodayData(dateLabel: "Today", classes: [
        ClassItem(name: "Organic Chemistry", time: "9:30 AM", status: nil),
        ClassItem(name: "Modern Literature", time: "1:15 PM", status: "present")
      ])
    )
  }

  func getSnapshot(in context: Context, completion: @escaping (AttendizeEntry) -> Void) {
    completion(AttendizeEntry(date: Date(), data: loadTodayData()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<AttendizeEntry>) -> Void) {
    let entry = AttendizeEntry(date: Date(), data: loadTodayData())
    let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date().addingTimeInterval(1800)
    completion(Timeline(entries: [entry], policy: .after(next)))
  }
}

private func statusColor(_ status: String?) -> Color {
  switch status {
  case "present": return Color(red: 0.36, green: 0.51, blue: 0.44)
  case "late": return Color(red: 0.84, green: 0.60, blue: 0.24)
  case "absent": return Color(red: 0.77, green: 0.36, blue: 0.24)
  case "excused": return Color(red: 0.44, green: 0.53, blue: 0.66)
  default: return Color.gray.opacity(0.4)
  }
}

struct AttendizeWidgetEntryView: View {
  var entry: AttendizeEntry
  @Environment(\.widgetFamily) private var family

  private var maxRows: Int { family == .systemLarge ? 6 : 3 }

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack {
        Text("TODAY")
          .font(.system(size: 12, weight: .heavy))
          .foregroundColor(.secondary)
        Spacer()
        Text(entry.data.dateLabel)
          .font(.system(size: 12, weight: .semibold))
          .foregroundColor(.secondary)
      }

      if entry.data.classes.isEmpty {
        Spacer()
        Text("No classes today")
          .font(.system(size: 15, weight: .semibold))
          .foregroundColor(.secondary)
        Spacer()
      } else {
        ForEach(entry.data.classes.prefix(maxRows), id: \.self) { item in
          HStack(spacing: 8) {
            Circle()
              .fill(statusColor(item.status))
              .frame(width: 8, height: 8)
            Text(item.name)
              .font(.system(size: 14, weight: .semibold))
              .lineLimit(1)
            Spacer(minLength: 6)
            Text(item.time)
              .font(.system(size: 12, weight: .medium))
              .foregroundColor(.secondary)
          }
        }
        Spacer(minLength: 0)
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .padding(14)
    // Opens the app's Check-In screen on tap.
    .widgetURL(URL(string: "attendance-tracker://check-in"))
  }
}

struct AttendizeWidget: Widget {
  let kind: String = "AttendizeWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      if #available(iOS 17.0, *) {
        AttendizeWidgetEntryView(entry: entry)
          .containerBackground(.fill.tertiary, for: .widget)
      } else {
        AttendizeWidgetEntryView(entry: entry)
          .background(Color(UIColor.systemBackground))
      }
    }
    .configurationDisplayName("Today's Classes")
    .description("Your classes for today, with one-tap check-in.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}

@main
struct AttendizeWidgetBundle: WidgetBundle {
  var body: some Widget {
    AttendizeWidget()
  }
}
