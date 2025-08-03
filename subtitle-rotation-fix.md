# Subtitle Advancement 字幕轮换修复验证

## 问题描述
字幕轮换时机没有受到 subtitle advancement 影响，导致：
1. 当设置 advancement = +2s 时，下层字幕提前2秒转到上层，但新的下层字幕要等2秒后才出现
2. 上层字幕消失的时机也没有考虑 advancement
3. 暂停时的轮换逻辑与播放时不一致

## 修复方案
将字幕轮换的判断基准从原始字幕时间戳改为实际的第一个字符显示时间（包含 advancement）。

## 修复内容

### 1. generateKaraokeSubtitleHtml 函数（播放时轮换逻辑）
**位置：** 第 183-214 行

**修复前：**
```typescript
const nextSubtitle = allSubtitles.find(s => s.index === currentSubtitleIndex + 1);
const nextSubtitleStarted = nextSubtitle && currentTime >= nextSubtitle.start;

const nextNextSubtitle = allSubtitles.find(s => s.index === currentSubtitleIndex + 2);
if (nextNextSubtitle && currentTime >= nextNextSubtitle.start) {
    shouldShow = false;
}
```

**修复后：**
```typescript
// 检查下一句字幕的状态 - 使用第一个字符的实际显示时间（包含advancement）
const nextSubtitle = allSubtitles.find(s => s.index === currentSubtitleIndex + 1);
let nextSubtitleStarted = false;
if (nextSubtitle && nextSubtitle.karaokeSegments && nextSubtitle.karaokeSegments.length > 0) {
    // 对于卡拉OK字幕，使用第一个片段的调整后时间
    const firstSegmentStartTime = nextSubtitle.karaokeSegments[0].startTime + offset + advancement;
    nextSubtitleStarted = currentTime >= firstSegmentStartTime;
} else if (nextSubtitle) {
    // 对于普通字幕，使用原始开始时间
    nextSubtitleStarted = currentTime >= nextSubtitle.start;
}

// 检查是否应该消失（当下下句的第一个字开始显示时）
const nextNextSubtitle = allSubtitles.find(s => s.index === currentSubtitleIndex + 2);
let nextNextSubtitleStarted = false;
if (nextNextSubtitle && nextNextSubtitle.karaokeSegments && nextNextSubtitle.karaokeSegments.length > 0) {
    // 对于卡拉OK字幕，使用第一个片段的调整后时间
    const firstSegmentStartTime = nextNextSubtitle.karaokeSegments[0].startTime + offset + advancement;
    nextNextSubtitleStarted = currentTime >= firstSegmentStartTime;
} else if (nextNextSubtitle) {
    // 对于普通字幕，使用原始开始时间
    nextNextSubtitleStarted = currentTime >= nextNextSubtitle.start;
}

if (nextNextSubtitleStarted) {
    shouldShow = false; // 下下句的第一个字开始显示时，当前句消失
}
```

### 2. KaraokeSubtitle 组件暂停时轮换逻辑
**位置：** 第 355-386 行

应用了与播放时完全相同的逻辑，确保暂停时的显示与播放时保持一致。

### 3. 主字幕显示逻辑中的轮换判断
**位置：** 第 1031-1081 行

**修复前：**
```typescript
if (prevSubtitle && now >= prevSubtitle.end && now >= currentSub.start) {
    // 前一句已结束且当前句已开始，保留前一句在上行
}

if (nextSubtitle && now >= nextSubtitle.start) {
    // 下一句开始时，前前句消失
}
```

**修复后：**
```typescript
// 检查当前句是否已经开始显示第一个字符（考虑advancement）
let currentSubStarted = false;
if (currentSub.karaokeSegments && currentSub.karaokeSegments.length > 0) {
    const firstSegmentStartTime = currentSub.karaokeSegments[0].startTime + (offset || 0) + (advancement || 0);
    currentSubStarted = now >= firstSegmentStartTime;
} else {
    currentSubStarted = now >= currentSub.start;
}

if (prevSubtitle && now >= prevSubtitle.end && currentSubStarted) {
    // 前一句已结束且当前句第一个字已开始显示，保留前一句在上行
}

// 检查下一句是否开始（轮动触发条件）- 使用第一个字符的实际显示时间
let nextSubtitleStarted = false;
if (nextSubtitle && nextSubtitle.karaokeSegments && nextSubtitle.karaokeSegments.length > 0) {
    // 对于卡拉OK字幕，使用第一个片段的调整后时间
    const firstSegmentStartTime = nextSubtitle.karaokeSegments[0].startTime + (offset || 0) + (advancement || 0);
    nextSubtitleStarted = now >= firstSegmentStartTime;
} else if (nextSubtitle) {
    // 对于普通字幕，使用原始开始时间
    nextSubtitleStarted = now >= nextSubtitle.start;
}

if (nextSubtitleStarted) {
    // 下一句第一个字开始显示时，前前句消失
}
```

## 修复效果
1. ✅ 字幕轮换时机现在基于实际的第一个字符显示时间
2. ✅ advancement 设置影响所有轮换判断（下层→上层，上层→消失）
3. ✅ 播放时和暂停时使用一致的轮换逻辑
4. ✅ 保持对普通字幕的兼容性

## 测试建议
1. 设置 advancement = +2s，观察字幕轮换是否延迟2秒
2. 设置 advancement = -1s，观察字幕轮换是否提前1秒
3. 在播放和暂停状态下验证轮换时机一致性
4. 验证普通字幕（非卡拉OK）的轮换不受影响

## 技术要点
- 区分卡拉OK字幕和普通字幕的处理方式
- 使用 `karaokeSegments[0].startTime + offset + advancement` 作为轮换判断基准
- 确保所有相关代码位置的一致性
- 保持字幕结束时间（s.end）不受 advancement 影响（这是正确的）
