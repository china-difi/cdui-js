> 说明
> 颜色色阶：D (Dark 加暗) L（Light 加亮）XL（再加亮）XD（再加暗）依此类推
> 距离大小：L（放大）S（缩小）XL（再加大）XS（再缩小）依此类推
> 以 margin、border、padding 开头的样式，会自动在其后生成 l、r、t、b 及 x、y 六个组合，如：margin-l（margin-left），margin-x（margin-left + margin-right），border-l（border-left），border-y-color（border-top-color + border-bottom-color）


# margin 外边距

.margin-XXS: 8px;
.margin-XS: 10px;
.margin-S: 12px;
.margin: 16px;
.margin-L: 20px;
.margin-XL: 40px;
.margin-XXL: 60px;

+ .le-800

.margin-XXS: 6px;
.margin-XS: 8px;
.margin-S: 10px;
.margin: 14px;
.margin-L: 16px;
.margin-XL: 30px;
.margin-XXL: 40px;

+ .le-480

.margin-XXS: 4px;
.margin-XS: 8px;
.margin-S: 12px;
.margin: 16px;
.margin-L: 20px;
.margin-XL: 32px;
.margin-XXL: 40px;


# padding 内边距

.padding-XXS: 4px;
.padding-XS: 6px;
.padding-S: 8px;
.padding: 10px;
.padding-L: 14px;
.padding-XL: 24px;
.padding-XXL: 40px;

+ .le-480

.padding-XXS: 4px;
.padding-XS: 6px;
.padding-S: 8px;
.padding: 12px;
.padding-L: 16px;
.padding-XL: 24px;
.padding-XXL: 40px;

# border 边框

.border: 1px;
.border-bold: 2px;
.border-bolder: 4px;


# border-color 边框颜色

.border-c-XXL: #;
.border-c-XL: #;
.border-c-L: #F5F5F5;
.border-c: #E4E4E4;
.border-c-D: #;
.border-c-XD: #;
.border-c-XXD: #;

.border-c-primary: #FF4000;
.border-c-secondary: #FFD1C3;
.border-c-error: #FF4E4E;
.border-c-warn: #;
.border-c-info: #;
.border-c-disabled: #FF4E4E;

.border-c-active: #ffffff;
.border-c-primary-active: #ffffff;

.border-c-focus: #ffffff;
.border-c-primary-focus: #ffffff;

.border-c-hover: #ffffff;
.border-c-primary-hover: #ffffff;

.border-c-selected: #ffffff;
.border-c-primary-selected: #ffffff;

+ .dark
.border-c-primary: #000000

# border-style 边框样式

.border-s-dashed: dashed;
.border-s-dotted: dotted;


# border-radius 圆角边框

.round-XXS: ;
.round-XS: 6px;
.round-S: 10px;
.round: 12px;
.round-L: 14px;
.round-XL: 20px;
.round-XXL: ;

+ .le-480

.round-XXS: 2px;
.round-XS: 4px;
.round-S: 6px;
.round: 8px;
.round-L: 10px;
.round-XL: 12px;
.round-XXL: 40px;


# background-color 背景颜色

.bg-c-XXL: #;
.bg-c-XL: #ffffff;
.bg-c-L: #ffffff;
.bg-c: #ffffff;
.bg-c-D:  #F7F8FA;
.bg-c-XD: #F5F5F5;
.bg-c-XXD: #F5F5F5;

.bg-c-primary: #FFF3EF;
.bg-c-secondary: #FFEDED;
.bg-c-error: #;
.bg-c-warn: #;
.bg-c-info: #;
.bg-c-disabled: #;

.bg-c-active: #ffffff;
.bg-c-primary-active: #ffffff;

.bg-c-focus: #ffffff;
.bg-c-primary-focus: #ffffff;

.bg-c-hover: #;
.bg-c-primary-hover: #69F469;

.bg-c-selected: #ffffff;
.bg-c-primary-selected: #ffffff;

+ .dark
.bg-c: #101113;


# color 字体颜色

.color-XXL: #ffffff;
.color-XL: #C2C3CB;
.color-L: #A2A7AD;
.color: #888F97;
.color-D: #1B212D;
.color-XD: #1B212D;
.color-XXD: #1B212D;

.color-primary: #FF4000;
.color-secondary: #FFD1C3;
.color-error: #FF4E4E;
.color-warn: #;
.color-info: #;
.color-disabled: #02C58D;

.color-active: #ffffff;
.color-primary-active: #FF4000;

.color-focus: #ffffff;
.color-primary-focus: #FF4000;

.color-hover: #ffffff;
.color-primary-hover: #FF4000;

.color-selected: #ffffff;
.color-primary-selected: #FF4000;

+ .dark

.color-D: #ffffff;


# font-size 字体大小

.font-s-XXS: 12px;
.font-s-XS: 12px;
.font-s-S: 14px;
.font-s: 16px;
.font-s-L: 20px;
.font-s-XL: 22px;
.font-s-XXL: 32px;

+ .le-480

.font-s-XXS: 10px;
.font-s-XS: 12px;
.font-s-S: 14px;
.font-s: 16px;
.font-s-L: 20px;
.font-s-XL: 24px;
.font-s-XXL: 28px;


# font-weight 字体粗细

.font-lighter: lighter;
.font-bold: bold;
.font-bolder: bolder;


# icon-color 图标颜色

.icon-c-XXL: #;
.icon-c-XL: #;
.icon-c-L: #ffffff;
.icon-c: #A2A7AD;
.icon-c-D: #1B212D;
.icon-c-XD: #;
.icon-c-XXD: #;

.icon-c-primary: #FF4000;
.icon-c-secondary: #2BA8F7;
.icon-c-error: #FF4E4E;
.icon-c-warn: #;
.icon-c-info: #;
.icon-c-disabled: #FF4E4E;

.icon-c-active: #ffffff;
.icon-c-primary-active: #ffffff;

.icon-c-hover: #ffffff;
.icon-c-primary-hover: #FF4000;

.icon-c-selected: #ffffff;
.icon-c-primary-selected: #FF4000;


# icon-size 图标大小

.icon-s-XXS: 12px;
.icon-s-XS: 14px;
.icon-s-S: 16px;
.icon-s: 18px;
.icon-s-L: 20px;
.icon-s-XL: 24px;
.icon-s-XXL: 32px;


# button 按钮

.button { background-color: #21282D; color: #ffffff; border-radius: 14px; outline: none; border: none; min-width: 60px; padding: 4px 8px; }
.button:active { background-color: #1D252B; }
.button:focus { background-color: #1D252B; border: 2px solid #FFFFFF; }
.button:hover { background-color: #2D363B; }
.button:disabled { color: #8693B6; }

.button-primary { background-color: #FF4000; color: #ffffff; border-radius: 12px; outline: none; border: none; min-width: 60px; padding: 4px 8px; }
.button-primary:active { background-color: #FF7A51; }
.button-primary:focus { background-color: #FF7A51; }
.button-primary:hover { background-color: #FF7A51; }
.button-primary:disabled { background-color:#FFD1C3; }


# link 链接

.link { }
.link-primary { };


# textbox 文本框

.textbox { border: 1px solid #e4e4e4; }
.textbox:focus { border: 1px solid #1b212d; }


# combobox 下拉框

.combobox { border: 1px solid #e4e4e4; background: #ffffff; }
.combobox:has(.combobox-input:focus) { border: 1px solid #1b212d; }
.combobox-popup { border: 1px solid #e4e4e4; background: #ffffff; }


# canlendar monthwidget yearwidget 日历 年月 年

.datewidget { border: 1px solid #e4e4e4; background: #ffffff; }
.datewidget-header > .icon { stroke: #1b212d; }
.datewidget-item.disabled { color: #e4e4e4; }
.datewidget-item.prev-block, .datewidget-item.next-block { color: #888f97; }
.datewidget-item.today::before { background: #f5f5f5; }
.datewidget-item.selected { color: #ffffff; }
.datewidget-item.selected::before { background: #ff4000; }

.canlendar-weeks > span { color: #888f97; }


# datepicker 日期选择

.datepicker { border: 1px solid #e4e4e4; background: #ffffff; }
.datepicker:has(.datepicker-input:focus) { border: 1px solid #1b212d; }


# carousel 轮播

.carousel-backward, .carousel-forward { background: rgba(255, 255, 255, 0.1); }
.carousel-dot { background: rgba(65, 72, 90, 1); }
.carousel-dot.selected { background: #ffffff; }
