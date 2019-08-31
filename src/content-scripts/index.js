/* global $ APP_CONFIG*/
// APP_CONFIG import from src/config/config

/**
 * SteamImgUrl
 * Steam CDN 图片地址处理
 * @param {string} url
 * @example https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SRYAFMIcKL_PArgVSL403ulRUWEndVKv0jp6KCw07IVMPs7n9LwU0h6HNcjlBtYvlkteKk_SgNbmIxT8J7JUp2OiYrd-gixq-uxR6VrmHMw/330x192
 */
class SteamImgUrl {
    constructor(url) {
        this.url = url;
        this.defaultUrl = '';
        this.resetUrl();
    }
    resetUrl() {
        let urlArray = this.url.split('/');
        urlArray.pop();
        this.defaultUrl = urlArray.join('/') + '/';
    }
    getFullSize() {
        return this.defaultUrl;
    }
    get96size() {
        return this.defaultUrl + '96fx96f';
    }
    get62size() {
        return this.defaultUrl + '62fx62f';
    }
};

/**
 * chromeHandle
 * chrome API 相关方法
 */
const chromeHandle = {
    /**
     * storageAdd
     * 向 Chrome storage 目标表内增加数据
     * @param {string} table_name
     * @param {object} data 
     * @param {function} callback callback function 回调函数
     */
    storageAdd(table, data, callback) {
        chrome.storage.local.get([table], result => {
            // 现有数据缓存 
            let cache = [];
            // 新的待存储对象
            let storageData = {};
            // 当前表已存在则获取其浅拷贝增量增加并判断重复
            if (typeof result[table] !== 'undefined') {
                cache = result[table].slice();
                // 如果当前 data 一存在则 return
                for (const key in cache) {
                    if (cache.hasOwnProperty(key)) {
                        // 经过测试 Steam 背景图物品 name 有相同情况
                        if (cache[key].marketUrl === data.marketUrl) return;
                    }
                }
            }
            // 当前表不存在直接增加新数据
            cache.push(data);
            storageData[table] = cache;
            // 把修改完缓存数据写入存储
            chrome.storage.local.set(storageData, () => {
                // 执行回调函数 并把存储数据作为参数返回
                callback(storageData[table]);
            });
        });
    },
    /**
     * sendBadgeMsg
     * Send message to background.js to update Badge on Chrome
     * 向 background.js 发送 Chrome 右上角扩展 ICON 数量更新消息
     * @param {number} num Badge 显示数量
     */
    sendBadgeMsg(num) {
        // 设置 badge 图标当前存储数量
        const message = {
            action: APP_CONFIG.actionType.BADGE_UPDATE,
            data: num.toString()
        }
        // 发送消息给 background.js
        chrome.runtime.sendMessage(message, response => { });
    }
};

/**
 * inventoryTools
 * Steam 个人库存增强
 */
const inventoryTools = {
    init() {
        // 非 Steam 个人库存增强不处理
        // @example https://steamcommunity.com/id/userid/inventory/
        if (!/\/inventory/.test(window.location.href)) return;
        // Init inventorySidebar
        this.inventorySidebar();
    },
    /**
     * inventorySidebar
     * 库存侧边栏增加暂存预览功能
     */
    inventorySidebar() {
        let _this = this;
        // 监听侧边栏缩略图载入并追加按钮
        $('#iteminfo1_item_icon, #iteminfo0_item_icon').on('load', function () {
            // 侧边栏容器
            const inventorySidebar = $(this).parents('.inventory_iteminfo');
            const buttonArea = inventorySidebar.find('.item_actions');
            // 定义暂存背景图项目按钮
            const buttonHtml = `<a class="btn_small btn_grey_white_innerfade btn_std" href="javascript:;">
                                    <span>Steam Design Tools 预览</span>
                                </a>`;
            const button = $(buttonHtml);
            button.attr('data-url', $(this).attr('src'));

            // reset 跳转button状态
            inventorySidebar.find('.btn_std').remove();
            // 仅在背景图类上提供触发按钮
            if (buttonArea.is(':visible')) {
                button.appendTo(buttonArea);
            }
        });
        // 暂存预览功能触发
        $('.btn_std').live('click', function () {
            // 侧边栏容器
            const inventorySidebar = $(this).parents('.inventory_iteminfo');
            const marketSection = inventorySidebar.find('.market_item_action_buyback_at_price');

            // 背景图素材所有数据
            let backgroundData = APP_CONFIG.getTableStructure();
            backgroundData = {
                name: inventorySidebar.find('.hover_item_name').text(),
                backgroundUrl: new SteamImgUrl($(this).attr('data-url')).getFullSize(),
                marketUrl: marketSection.prev().prev().find('a').attr('href'),
                marketPrice: _this.priceExtract(marketSection.prev().html()),
                isLike: false
            };

            // 写入 chrome.storage
            chromeHandle.storageAdd(APP_CONFIG.TABLE_NAME, backgroundData, (data) => {
                if (typeof data !== 'undefined' && data.length > 0) {
                    // 设置 badge 图标当前存储数量
                    chromeHandle.sendBadgeMsg(data.length);
                }
            });
        });
    },
    /**
     * priceExtract
     * 从价格 HTML 中解析出价格
     * @param {string} str 
     * @example 開始価格: ¥ 0.23 <br> xadasd
     * @example Starting at: ¥ 0.24 <br> Volume
     * @example 正在加载中异常: //steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" alt="处理中...">
     */
    priceExtract(str) {
        // 解析到加载中异常返回 ??.00
        if (!/login\/throbber.gif/.test(str)) return '??.00';

        const strResult = str.split('<br>')[0];
        const divSymbol = /：/.test(str) ? '：' : ':';
        return strResult.split(divSymbol)[1].trim();
    }
};

/**
 * profileTools
 * Steam 个人资料页预览增强
 */
const profileTools = {
    init() {
        // 非个人资料页不处理
        // @example https://steamcommunity.com/id/userid
        if (!/\/id/.test(window.location.href) || $('.profile_page').length === 0) return;
        // Set message listener wait message from chrome extension 
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            // Set profile background
            if (request.action === APP_CONFIG.actionType.SET_BACKGROUND && request.data) {
                this.setProfileBackground(request.data);
            }
        });
        // Init showcase preview
        this.setShowcasePreview();
    },
    /**
     * setProfileBackground
     * Set background img 设置个人资料背景
     * @param {string} backgroundUrl 
     */
    setProfileBackground(backgroundUrl) {
        // 资料页容器
        const profilePage = $('.profile_page').eq(1);
        profilePage.css('background-image', 'url(' + backgroundUrl + ')')
            .find('.profile_background_image_content').css('background-image', 'url(' + backgroundUrl + ')');
    },

    /**
     * setShowcasePreview
     * Steam showcase img preview 展柜图片预览
     */
    setShowcasePreview() {
        const showcaseButton = $(`<a class="sdt-showcase-change" href="javascript:;">
                                    <span class="profile_customization_edit_icon"></span>
                                    <input class="sdt-img-cache" title="New image" type="file" accept="image/*"/>
                                </a>`);
        const buttonStyle = `display: none; position: absolute; top: 4px; left: 4px; z-index: 1; overflow: hidden; height: 16px; padding: 8px 8px; background: #5491cf; border-radius: 3px; box-shadow: 2px 2px 2px rgba(0,0,0,0.5);`;
        const inputStyle = `position: absolute; left: 0; top: 0; z-index: 10; opacity: 0; color: transparent; width: 100%; height: 100%; cursor: pointer; background:transparent; font-size: 20px;`;
        showcaseButton.attr('style', buttonStyle)
            .find('.sdt-img-cache').attr('style', inputStyle);

        // Append showcaseButton
        $('.screenshot_showcase .showcase_slot').append(showcaseButton);

        // Showcase slot mouseenter event
        $('.screenshot_showcase .showcase_slot').live('mouseenter', function () {
            const thisButton = $(this).find('.sdt-showcase-change');
            const showcaseImg = $(this).find('.screenshot_showcase_screenshot').find('img');
            const showcaseImgSize = showcaseImg.width() + 'px * ' + showcaseImg.height() + 'px';
            // Add current showcase size
            $(this).find('.sdt-img-cache').attr('title', '当前尺寸：' + showcaseImgSize + ' 点击预览新图片');
            thisButton.show();
        }).live('mouseleave', function () {
            const thisButton = $(this).find('.sdt-showcase-change');
            thisButton.hide();
        });

        // Upload and change showcase img 上传预览图片
        $('.sdt-img-cache').live('change', function (event) {
            const showcaseImg = $(this).parents('.showcase_slot').find('.screenshot_showcase_screenshot').find('img');
            const file = $(this)[0].files[0];
            // Use FileReader get Base64 url
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                showcaseImg.attr('src', e.target.result);
            }
        });
    }
};

/**
 * marketTools
 * Steam 市场预览增强
 */
const marketTools = {
    init() {
        // 非 Steam 市场不处理
        // @example https://steamcommunity.com/market/search?q=XXX
        if (!/\/market/.test(window.location.href) || $('.market_listing_row').length === 0) return;
        this.setAddButton();
    },
    /**
     * setAddButton
     * 增加 background 暂存 button
     */
    setAddButton() {
        // Steam 物品项
        const listItem = $('.market_listing_row')
        // addButton 相关
        const addButton = $('<span class="sdt-add-button" title="使用 Steam Design tools 预览">+</span>');
        const buttonStyle = `position: absolute; right: 158px; top: 25px; z-index: 10; display: inline-block; height: 24px; width: 26px; line-height: 24px; text-align: center; background-color: #68932f; border-radius: 2px; color: #d2ff96; font-size: 20px;`;
        addButton.attr('style', buttonStyle);

        // TODO: 国际化时增加繁体中文、日文等判断
        // 是否为 background 类型 Steam 物品字符串
        const backgroundTestSring = /个人资料背景|background/;
        // 列表追加事件
        listItem.live('mouseenter', function () {
            // 只给 background 类型 Steam 物品追加 addButton
            const itemType = $(this).find('.market_listing_game_name').text();
            if (backgroundTestSring.test(itemType)) {
                $(this).append(addButton);
            }
        }).live('mouseleave', function () {
            $(this).find('.sdt-add-button').remove();
        });

        // addButton 暂存预览功能触发
        $('.sdt-add-button').live('click', function (event) {
            event.preventDefault();

            // 当前 Steam 物品项
            const curlistItem = $(this).parents('.market_listing_row');
            const backgroundUrlEle = curlistItem.find('.market_listing_item_img');

            // 处理 Steam 可能出现的不存背景图的背景图商品异常
            if (backgroundUrlEle.length === 0) return;

            // 背景图素材所有数据
            let backgroundData = APP_CONFIG.getTableStructure();
            backgroundData = {
                name: curlistItem.find('.market_listing_item_name').text(),
                backgroundUrl: new SteamImgUrl(backgroundUrlEle.attr('src')).getFullSize(),
                marketUrl: curlistItem.parents('.market_listing_row_link').attr('href'),
                marketPrice: curlistItem.find('.normal_price').eq(1).text(),
                isLike: false
            };

            // Save data into chrome storage
            chromeHandle.storageAdd(APP_CONFIG.TABLE_NAME, backgroundData, (data) => {
                if (typeof data !== 'undefined' && data.length > 0) {
                    // 设置 badge 图标当前存储数量
                    chromeHandle.sendBadgeMsg(data.length);
                }
            });
        }).live('mouseenter', function () {
            $(this).css({ 'background-color': '#8ac33e' });
        }).live('mouseleave', function () {
            $(this).css({ 'background-color': '#68932f' });
        });
    }
};

/**
 * DOM READY 注册事件
 */
$(document).ready(function () {
    inventoryTools.init();
    profileTools.init();
    marketTools.init();
});