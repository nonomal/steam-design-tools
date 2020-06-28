# Steam Design Tools
> 一个 Steam 个人资料页背景图和展柜设计增强 Chrome 扩展工具<br/>
> *「市场里面花钱买个背景图竟然不能预览，只能看图想象，不能忍」*

<img src="https://cdn.jsdelivr.net/gh/mtmzorro/steam-design-tools@1.0.1/docs/assets/img/app.png" width="825"  alt="app" />

## 下载安装

* [Chrome 网上应用店](https://chrome.google.com/webstore/detail/steam-design-tools/ipndeiedddcbjjlfbinflapdlommhalf) 上架完成
* [Releases](https://github.com/mtmzorro/steam-design-tools/releases) ~~`.crx` 文件下载，然后在 Chrome 中打开 chrome://extensions/ 将 `.crx` 文件托进去即可安装~~ Chrome 最新版本已经阻止`.crx`直接运行，请下载`.zip`文件包，解压后进入`chrome://extensions/`点击「加载已解压的扩展程序」按钮。

## 更新日志
### 1.0.2
* Feature 新增存储 Steam 2020 夏促中个人资料背景用于实时预览，因 Steam 动态背景视频 URL 暂无可用规则获取完整视频，暂不支持动态背景。
* Feature 完善操作结果提示。
* Bug Fix 个人库存中导入夏促积分换购物品失败的 BUG（感谢 盒友 Omega 沟通反馈）。
* Bug Fix 个人资料页动态背景层级最高，无法预览静态背景的问题。


## 功能

* 存储 Steam 2020 夏促中个人资料背景（不含动态背景）。
* 存储 Steam 市场中的背景图物品。
* 存储 Steam 个人库存中的背景图物品。
* 将存储中的背景图物品应用于 Steam 个人资料页进行实时预览。
* 扩展个人资料页中展柜（艺术品、截图）功能，直接在展柜替换本地图片实时预览。

## 功能预览

**存储 Steam 市场中的背景图物品，并在个人资料页预览**

![Feature-1](https://cdn.jsdelivr.net/gh/mtmzorro/steam-design-tools@1.0.1/docs/assets/img/feature-1.gif)

**存储 Steam 个人库存中的背景图物品，并在个人资料页预览**

![Feature-2](https://cdn.jsdelivr.net/gh/mtmzorro/steam-design-tools@1.0.1/docs/assets/img/feature-2.gif)

**展柜（艺术品、截图）替换本地图片实时预览，按钮提示当前图片尺寸**

![Feature-3](/docs/assets/img/feature-3.gif)

## 开发

```bash
git clone https://github.com/mtmzorro/steam-design-tools.git

cd steam-design-tools

yarn install

# Start project 
yarn start

# Build Chrome Extension 
yarn build
```