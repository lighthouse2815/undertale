import data from './waterfall-undyne-dialogue.json' with { type: 'json' };

// obj_undyne1: trang 157 bị ghi đè, 169 kết thúc writer trước các dòng 170–174.
export const waterfallUndyneReport = data.report;
export const waterfallUndyneReportEnd = data.reportEnd;
export function waterfallUndyneKid(papyrusKilled) { return papyrusKilled ? data.kidNoPapyrus : data.kid; }
