# Subtitle Advancement 功能实现总结

## 功能概述
为 asbplayer 添加了 "Subtitle Advancement" 功能，专门用于微调卡拉OK字幕的逐字弹出时间。

## 功能特点
1. **仅对卡拉OK字幕生效**：只有在检测到导入的字幕文件包含卡拉OK格式（带有 `karaokeSegments`）时，Subtitle Advancement 输入框才会显示
2. **独立于 Subtitle Offset**：在 Subtitle Offset 完成基础时间校准后，Subtitle Advancement 提供额外的微调
3. **仅影响视频显示**：只影响视频界面上的卡拉OK字幕显示（`karaoke-top-line` 和 `karaoke-bottom-line` 类），不影响 Anki 导出、右侧字幕栏等其他功能

## 实现的文件

### 1. 新增组件
- `common/components/SubtitleAdvancementInput.tsx` - 专用的时间输入组件

### 2. 修改的核心文件
- `common/settings/settings.ts` - 添加 `lastSubtitleAdvancement` 设置项
- `common/app/components/Controls.tsx` - 添加 Subtitle Advancement 输入框到控制栏
- `common/app/components/VideoPlayer.tsx` - 实现 advancement 逻辑和状态管理

### 3. 配置文件
- `common/settings/settings-provider.ts` - 添加默认值
- `common/settings/settings-import-export.ts` - 添加导入导出支持
- `common/settings/settings-import-export.test.ts` - 添加测试用例

### 4. 国际化
- `common/locales/en.json` - 英文翻译
- `common/locales/zh_CN.json` - 中文翻译

## 使用方式
1. 导入包含卡拉OK时间戳的特殊 VTT 格式字幕文件
2. 系统自动检测到卡拉OK字幕后，在控制栏中的 Subtitle Offset 右侧会显示 "Subtitle Advancement" 输入框
3. 用户可以输入正负数值（单位：秒）来微调卡拉OK字幕的逐字弹出时间
4. 调整只影响视频上的字幕显示效果，不影响其他功能

## 技术实现要点
1. **卡拉OK检测**：通过检查 `subtitle.karaokeSegments` 存在且长度大于0来判断
2. **时间计算**：在原有的 `offset` 基础上叠加 `advancement` 值
3. **渲染逻辑**：修改 `generateKaraokeSubtitleHtml` 函数，在计算每个字符显示时间时应用 advancement
4. **状态管理**：添加独立的 `advancement` 状态，通过 `karaokeUpdateTrigger` 强制重新渲染
5. **UI条件显示**：只有在存在卡拉OK字幕时才显示 advancement 输入框

## 与现有功能的关系
- **Subtitle Offset**：负责整体字幕与音视频的同步
- **Subtitle Advancement**：在 Offset 校准基础上，专门微调卡拉OK字幕的逐字时间
- **独立作用域**：Advancement 的调整不会影响 Anki 卡片制作、字幕栏显示等其他功能
