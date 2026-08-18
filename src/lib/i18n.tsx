import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "vi" | "en";

type Dict = Record<string, { vi: string; en: string }>;

const dict: Dict = {
  // Nav
  nav_today: { vi: "Hôm nay", en: "Today" },
  nav_history: { vi: "Lịch sử", en: "History" },
  nav_stats: { vi: "Thống kê", en: "Stats" },

  // Today page
  today_title: { vi: "Hôm nay bạn thế nào?", en: "How are you today?" },
  today_sub: { vi: "Chạm vào khuôn mặt gần nhất với cảm xúc của bạn", en: "Tap the face closest to how you feel" },
  today_done: { vi: "Đã ghi nhận hôm nay", en: "Logged for today" },
  today_update: { vi: "Đã có ghi chép hôm nay — chạm để cập nhật", en: "Already logged today — tap to update" },
  today_note_label: { vi: "Nhật ký nhỏ", en: "Short journal" },
  today_note_ph: { vi: "Hôm nay có gì đáng nhớ? (tùy chọn)", en: "Anything worth remembering? (optional)" },
  today_saved: { vi: "Đã lưu", en: "Saved" },
  today_saving: { vi: "Đang lưu…", en: "Saving…" },
  today_error: { vi: "Lưu thất bại", en: "Failed to save" },
  today_streak: { vi: "Chuỗi ngày", en: "Day streak" },
  today_days: { vi: "ngày", en: "days" },
  today_30d: { vi: "30 ngày gần đây", en: "Last 30 days" },
  today_empty_30d: { vi: "Bắt đầu ghi chép để thấy biểu đồ nhé!", en: "Start logging to see your chart!" },
  today_pick_first: { vi: "Chọn cảm xúc của bạn để bắt đầu", en: "Pick your mood to begin" },

  // Levels
  level_1: { vi: "Rất tệ", en: "Awful" },
  level_2: { vi: "Không tốt", en: "Low" },
  level_3: { vi: "Bình thường", en: "Okay" },
  level_4: { vi: "Khá tốt", en: "Good" },
  level_5: { vi: "Tuyệt vời", en: "Great" },

  // History page
  hist_title: { vi: "Nhật ký của tôi", en: "My journal" },
  hist_empty: { vi: "Chưa có ghi chép nào. Bắt đầu từ trang Hôm nay nhé!", en: "No entries yet. Start from Today!" },
  hist_edit: { vi: "Sửa", en: "Edit" },
  hist_save: { vi: "Lưu", en: "Save" },
  hist_cancel: { vi: "Hủy", en: "Cancel" },
  hist_delete: { vi: "Xóa", en: "Delete" },
  hist_confirm_delete: { vi: "Xóa ghi chép ngày này?", en: "Delete this day's entry?" },
  hist_export: { vi: "Xuất JSON", en: "Export JSON" },
  hist_note_empty: { vi: "(không có nhật ký)", en: "(no journal)" },
  hist_view: { vi: "Xem chi tiết", en: "View details" },
  hist_close: { vi: "Đóng", en: "Close" },

  // Stats page
  stats_title: { vi: "Thống kê", en: "Statistics" },
  stats_total_days: { vi: "Số ngày ghi", en: "Days logged" },
  stats_avg: { vi: "Cảm xúc TB", en: "Avg mood" },
  stats_best_streak: { vi: "Chuỗi dài nhất", en: "Best streak" },
  stats_best_day: { vi: "Ngày tuyệt nhất", en: "Best day" },
  stats_trend: { vi: "Xu hướng", en: "Trend" },
  stats_trend_desc: { vi: "Đường trung bình 7 ngày giúp bạn thấy rõ chiều hướng", en: "7-day moving average shows the direction" },
  stats_distribution: { vi: "Phân bố cảm xúc", en: "Mood distribution" },
  stats_dist_desc: { vi: "Bạn dành bao nhiêu ngày ở mỗi mức", en: "How many days at each level" },
  stats_weekday: { vi: "Theo thứ trong tuần", en: "By weekday" },
  stats_weekday_desc: { vi: "Cảm xúc trung bình của từng thứ", en: "Average mood for each weekday" },
  stats_weekday_insight: { vi: "Bạn cảm thấy tốt nhất vào {day}", en: "You feel best on {day}" },
  stats_year: { vi: "Year in Pixels", en: "Year in Pixels" },
  stats_year_desc: { vi: "Mỗi ô là một ngày. Bức tranh một năm của bạn.", en: "One pixel per day — your year at a glance." },
  stats_insights: { vi: "Góc nhìn", en: "Insights" },
  stats_no_data: { vi: "Chưa đủ dữ liệu để thống kê — hãy ghi chép vài ngày nhé!", en: "Not enough data yet — log a few days first!" },
  stats_best_month: { vi: "Tháng vui nhất: {month}", en: "Happiest month: {month}" },
  stats_trending_up: { vi: "Cảm xúc đang đi lên 📈", en: "Mood is trending up 📈" },
  stats_trending_down: { vi: "Cảm xúc đang giảm 📉", en: "Mood is trending down 📉" },
  stats_steady: { vi: "Cảm xúc khá ổn định", en: "Mood is steady" },
  stats_streak_insight: { vi: "Chuỗi {n} ngày tốt nhất của bạn", en: "Your best streak of {n} days" },
  stats_30d_avg: { vi: "30 ngày: {v}/5", en: "30 days: {v}/5" },

  // Weekdays (starts Monday)
  d1: { vi: "T2", en: "Mon" },
  d2: { vi: "T3", en: "Tue" },
  d3: { vi: "T4", en: "Wed" },
  d4: { vi: "T5", en: "Thu" },
  d5: { vi: "T6", en: "Fri" },
  d6: { vi: "T7", en: "Sat" },
  d0: { vi: "CN", en: "Sun" },

  // Months (short)
  m0: { vi: "Th1", en: "Jan" },
  m1: { vi: "Th2", en: "Feb" },
  m2: { vi: "Th3", en: "Mar" },
  m3: { vi: "Th4", en: "Apr" },
  m4: { vi: "Th5", en: "May" },
  m5: { vi: "Th6", en: "Jun" },
  m6: { vi: "Th7", en: "Jul" },
  m7: { vi: "Th8", en: "Aug" },
  m8: { vi: "Th9", en: "Sep" },
  m9: { vi: "Th10", en: "Oct" },
  m10: { vi: "Th11", en: "Nov" },
  m11: { vi: "Th12", en: "Dec" },

  // Months (long, for history groups)
  l0: { vi: "Tháng 1", en: "January" },
  l1: { vi: "Tháng 2", en: "February" },
  l2: { vi: "Tháng 3", en: "March" },
  l3: { vi: "Tháng 4", en: "April" },
  l4: { vi: "Tháng 5", en: "May" },
  l5: { vi: "Tháng 6", en: "June" },
  l6: { vi: "Tháng 7", en: "July" },
  l7: { vi: "Tháng 8", en: "August" },
  l8: { vi: "Tháng 9", en: "September" },
  l9: { vi: "Tháng 10", en: "October" },
  l10: { vi: "Tháng 11", en: "November" },
  l11: { vi: "Tháng 12", en: "December" },

  // Months (full, for stats)
  f0: { vi: "Tháng 1", en: "January" },
  f1: { vi: "Tháng 2", en: "February" },
  f2: { vi: "Tháng 3", en: "March" },
  f3: { vi: "Tháng 4", en: "April" },
  f4: { vi: "Tháng 5", en: "May" },
  f5: { vi: "Tháng 6", en: "June" },
  f6: { vi: "Tháng 7", en: "July" },
  f7: { vi: "Tháng 8", en: "August" },
  f8: { vi: "Tháng 9", en: "September" },
  f9: { vi: "Tháng 10", en: "October" },
  f10: { vi: "Tháng 11", en: "November" },
  f11: { vi: "Tháng 12", en: "December" },

  // Status / misc
  status_loading: { vi: "Đang tải…", en: "Loading…" },
  status_error: { vi: "Không thể kết nối máy chủ", en: "Cannot reach server" },
  status_retry: { vi: "Thử lại", en: "Retry" },
  footer_note: { vi: "Dữ liệu được lưu trên MongoDB Atlas của bạn", en: "Data stored on your MongoDB Atlas" },
};

export const LANG_KEY = "my-emotion:lang";

type I18nCtx = { lang: Lang; t: (k: string, vars?: Record<string, string | number>) => string; setLang: (l: Lang) => void };

const Ctx = createContext<I18nCtx>({ lang: "vi", t: () => "", setLang: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(LANG_KEY);
    return saved === "en" ? "en" : "vi";
  });

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (k: string, vars?: Record<string, string | number>): string => {
    const e = dict[k] ?? dict[k] ?? { vi: k, en: k };
    let s = e[lang] ?? e.vi ?? k;
    if (vars) for (const [key, val] of Object.entries(vars)) s = s.replaceAll(`{${key}}`, String(val));
    return s;
  };

  return <Ctx.Provider value={{ lang, t, setLang: setLangState }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}
